import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document, DocumentInterface } from '@langchain/core/documents';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { DocumentEntity } from './document.entity';
import { vectorStoreConfig } from '@/configs/vector-store.config';
import { UserContext } from './role.type';
import { QueryRouterService } from './query-router.service';
import { RbacService } from './rbac.service';
import { HybridSearchService } from './hybrid-search.service';
import { ReRankerService } from './reranker.service';
import { ragConfig } from './rag.config';

@Injectable()
export class RagService implements OnModuleInit {
  private readonly logger = new Logger(RagService.name);

  private llm: ChatGoogleGenerativeAI;
  private vectorStore: PGVectorStore;
  private googleEmbeddings: GoogleGenerativeAIEmbeddings;
  private openaiEmbeddings: OpenAIEmbeddings;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(DocumentEntity)
    private readonly documentRepo: Repository<DocumentEntity>,
    private readonly router: QueryRouterService,
    private readonly rbac: RbacService,
    private readonly hybrid: HybridSearchService,
    private readonly reranker: ReRankerService,
  ) {}

  async onModuleInit() {
    // Model embedding của Gemini: gemini-embedding-001 → vector 3072 chiều
    this.googleEmbeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: this.config.get<string>('GEMINI_API_KEY'),
      model: 'gemini-embedding-001',
    });

    // Model embedding của OpenAI: text-embedding-3-large → vector 3072 chiều
    this.openaiEmbeddings = new OpenAIEmbeddings({
      openAIApiKey: this.config.get<string>('OPENAI_API_KEY'),
      modelName: 'text-embedding-3-large',
    });

    // Model chat dùng để tổng hợp câu trả lời cuối cùng
    this.llm = new ChatGoogleGenerativeAI({
      apiKey: this.config.get<string>('GEMINI_API_KEY'),
      model: 'gemini-2.5-flash',
      temperature: 0.2,
    });

    // PGVectorStore tự bật extension "vector" và tự tạo bảng
    // "document_chunks" nếu chưa tồn tại — không cần migration tay.
    this.vectorStore = await PGVectorStore.initialize(this.googleEmbeddings, vectorStoreConfig);
    this.logger.log('PGVectorStore (Gemini embeddings) đã sẵn sàng');
  }

  /**
   * Nạp 1 file PDF: trích xuất text -> chia nhỏ -> tạo vector -> lưu vào Postgres.
   * Đồng thời ghi nhận metadata (tên file, trạng thái) qua TypeORM.
   */
  async ingestPdf(filePath: string, sourceName: string) {
    const docRecord = this.documentRepo.create({
      filename: sourceName,
      status: 'processing',
    });
    await this.documentRepo.save(docRecord);

    try {
      const loader = new PDFLoader(filePath);
      const rawDocs = await loader.load();

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 150,
      });
      const chunks = await splitter.splitDocuments(rawDocs);

      const chunksWithMetadata = chunks.map(
        (chunk) =>
          new Document({
            pageContent: chunk.pageContent,
            metadata: {
              ...chunk.metadata,
              source: sourceName,
              documentId: docRecord.id,
            },
          }),
      );

      await this.vectorStore.addDocuments(chunksWithMetadata);

      docRecord.status = 'ready';
      docRecord.chunkCount = chunksWithMetadata.length;
      await this.documentRepo.save(docRecord);

      return {
        documentId: docRecord.id,
        chunksStored: chunksWithMetadata.length,
      };
    } catch (error) {
      docRecord.status = 'failed';
      await this.documentRepo.save(docRecord);
      this.logger.error(`Lỗi khi nạp file ${sourceName}`, error as Error);
      throw error;
    }
  }

  /**
   * Trả lời câu hỏi: tìm các đoạn liên quan nhất trong pgvector,
   * Nhồi vào prompt, rồi gọi Gemini để tổng hợp câu trả lời.
   */
  async ask(question: string) {
    const topK = 4;

    // Đối với similaritySearchWithScore()
    // - Trả về [Document, score].
    // - Với distanceStrategy = 'cosine', score là Cosine Distance.
    // - Distance càng gần 0 => document càng liên quan.
    // - Có thể filter theo distanceThreshold trước khi đưa cho LLM.
    const distanceThreshold = 0.25;
    const relevantDocs = await this.vectorStore.similaritySearchWithScore(question, topK);

    // Đối với similaritySearch()
    // - Chỉ lấy Top K document gần nhất.
    // - Không trả về score nên không biết document nào thực sự liên quan.
    // - Phù hợp khi luôn muốn đưa Top K document cho LLM.
    // const relevantDocs = await this.vectorStore.similaritySearch(question, topK);

    //
    const docs: DocumentInterface<Record<string, any>>[] = [];
    for (const [doc, score] of relevantDocs) {
      if (score < distanceThreshold) {
        docs.push(doc);
      }
    }

    const context = docs.map((doc, i) => `[Đoạn ${i + 1}] ${doc.pageContent}`).join('\n\n');

    const prompt = [
      'Bạn là trợ lý hỗ trợ khách hàng.',
      'Chỉ dùng thông tin trong phần "Ngữ cảnh" dưới đây để trả lời.',
      'Nếu ngữ cảnh không có thông tin liên quan, hãy nói rõ là không tìm thấy thông tin, đừng tự suy đoán.',
      '',
      'Ngữ cảnh:',
      context,
      '',
      `Câu hỏi: ${question}`,
      '',
      'Trả lời (ngắn gọn, rõ ràng):',
    ].join('\n');

    const response = await this.llm.invoke(prompt);

    return {
      answer: response.content,
      sources: docs.map((doc) => doc.metadata),
    };
  }

  /**
   *
   */
  async askAdvanced(question: string, user: UserContext) {
    // =========================
    // 1. ROUTER
    // =========================
    const allowedScopes = this.router.route(question, user.role);

    // =========================
    // 2. HYBRID RETRIEVAL
    // =========================
    let candidates = await this.hybrid.search(allowedScopes, question, this.vectorStore);

    // =========================
    // 3. RBAC FILTER
    // =========================
    candidates = this.rbac.filter(candidates, user.role);

    // =========================
    // 4. DISTANCE FILTER
    // =========================
    candidates = candidates.filter((c) => (c.score ?? 1) <= ragConfig.distanceThreshold);

    // =========================
    // 5. FALLBACK LEVEL 1
    // =========================
    if (!candidates.length) {
      return {
        answer: 'Không tìm thấy thông tin liên quan.',
        sources: [],
      };
    }

    // =========================
    // 6. RERANKER
    // =========================
    const reranked = this.reranker.rerank(question, candidates);

    const topDocs = reranked.slice(0, ragConfig.finalTopK);

    // =========================
    // 7. CONTEXT BUILDING
    // =========================
    const context = topDocs.map((d, i) => `[${i + 1}] ${d.content}`).join('\n\n');

    // =========================
    // 8. LLM
    // =========================
    const prompt = `
                      Bạn là trợ lý AI cho hệ thống e-commerce.

                      Chỉ sử dụng context bên dưới.
                      Nếu không đủ thông tin → nói "không tìm thấy thông tin".

                      Context:
                      ${context}

                      Question:
                      ${question}

                      Answer:
                    `;

    const response = await this.llm.invoke(prompt);

    return {
      answer: response.content,
      sources: topDocs.map((d) => d.metadata),
    };
  }

  /**
   * Dùng để test embeddings của Gemini, xem vector trả về có đúng 3072 chiều không.
   */
  async test() {
    const vector = await this.openaiEmbeddings.embedQuery('hello');
    console.log('vector length:', vector.length);
    console.log('expected length:', 3072);
  }
}
