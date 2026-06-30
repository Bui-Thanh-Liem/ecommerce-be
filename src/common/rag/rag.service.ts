import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions, Repository } from 'typeorm';
import { PGVectorStore, PGVectorStoreArgs } from '@langchain/community/vectorstores/pgvector';
import { Document, DocumentInterface } from '@langchain/core/documents';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { DocumentEntity } from './entity/document.entity';
import { UserContext } from './role.type';
import { QueryRouterService } from './query-router.service';
import { RbacService } from './rbac.service';
import { HybridSearchService } from './hybrid-search.service';
import { ReRankerService } from './reranker.service';
import { ragConfig } from './rag.config';
import { AiService } from '../ai/ai.service';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';

/**
 * distanceStrategy: Chiến lược tính khoảng cách giữa các vector embedding. Có thể là:
 * - 'cosine': Khoảng cách cosine (cosine similarity) (cùng hướng → 1, ngược hướng → -1)
 * - 'euclidean': Khoảng cách Euclidean (khoảng cách hình học)
 * - 'inner_product': Tích vô hướng (inner product)
 *
 * dimensions: Số chiều của vector embedding. Ví dụ, Gemini Embeddings có 1024 chiều.
 */

type GeneralVectorStore = Omit<PGVectorStoreArgs & { dimensions?: number }, 'tableName'>;

@Injectable()
export class RagService implements OnModuleInit {
  private readonly logger = new Logger(RagService.name);
  private vectorDocumentStore: PGVectorStore;
  private vectorProductStore: PGVectorStore;

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(DocumentEntity)
    private readonly documentRepo: Repository<DocumentEntity>,

    private readonly router: QueryRouterService,
    private readonly rbac: RbacService,
    private readonly hybrid: HybridSearchService,
    private readonly reranker: ReRankerService,

    private aiService: AiService,
  ) {}

  async onModuleInit() {
    const pgConfig = this.configService.get<PostgresConnectionOptions>('postgres');
    if (!pgConfig) {
      throw new InternalServerErrorException('Postgres configuration is missing');
    }

    //
    const generalVectorStore: GeneralVectorStore = {
      postgresConnectionOptions: {
        host: pgConfig.host,
        port: pgConfig.port,
        user: pgConfig.username,
        password: pgConfig.password,
        database: pgConfig.database,
      },
      columns: {
        idColumnName: 'id',
        vectorColumnName: 'embedding',
        contentColumnName: 'content',
        metadataColumnName: 'metadata',
      },
      distanceStrategy: 'cosine',
      dimensions: 1024,
    };

    //
    this.vectorDocumentStore = await PGVectorStore.initialize(this.aiService.embeddings, {
      ...generalVectorStore,
      tableName: 'document_chunks',
    });
    this.logger.log('PGVectorStore (Gemini embeddings) đã sẵn sàng');

    //
    this.vectorProductStore = await PGVectorStore.initialize(this.aiService.embeddings, {
      ...generalVectorStore,
      tableName: 'product_chunks',
    });
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

      await this.vectorDocumentStore.addDocuments(chunksWithMetadata);

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
   */
  async *ask(question: string, userType: 'CUSTOMER' | 'INTERNAL' = 'CUSTOMER') {
    const topK = 4;

    // Đối với similaritySearchWithScore()
    // - Trả về [Document, score].
    // - Với distanceStrategy = 'cosine', score là Cosine Distance.
    // - Distance càng gần 0 => document càng liên quan.
    // - Có thể filter theo distanceThreshold trước khi đưa cho LLM.
    const distanceThreshold = 0.25;
    const relevantDocs = await this.vectorDocumentStore.similaritySearchWithScore(question, topK);
    console.log('Relevant Docs :::', relevantDocs);

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

    const customerPrompt = [
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

    const internalPrompt = [
      'Bạn là Trợ lý Hệ thống nội bộ E-commerce.',
      'Hãy dùng thông tin sản phẩm sau đây để giải đáp chuyên môn cho nhân viên:',
      '',
      'Ngữ cảnh:',
      context,
      '',
      `Câu hỏi: ${question}`,
      '',
      'Trả lời (ngắn gọn, rõ ràng):',
    ].join('\n');

    // 3. Phân luồng Prompt theo đối tượng người dùng
    const systemInstruction = userType === 'INTERNAL' ? internalPrompt : customerPrompt;

    const promptTemplate = ChatPromptTemplate.fromMessages([
      ['system', systemInstruction],
      new MessagesPlaceholder('history'),
      ['human', '{input}'],
    ]);

    const chain = promptTemplate.pipe(this.aiService.model);

    const stream = await chain.stream({
      history: [],
      input: question,
    });

    for await (const chunk of stream) {
      const content = chunk.content as string;
      yield content; // Stream dữ liệu về client theo thời gian thực
    }
  }

  // /**
  //  *
  //  */
  // async askAdvanced(question: string, user: UserContext) {
  //   // =========================
  //   // 1. ROUTER
  //   // =========================
  //   const allowedScopes = this.router.route(question, user.role);

  //   // =========================
  //   // 2. HYBRID RETRIEVAL
  //   // =========================
  //   let candidates = await this.hybrid.search(allowedScopes, question, this.vectorStore);

  //   // =========================
  //   // 3. RBAC FILTER
  //   // =========================
  //   candidates = this.rbac.filter(candidates, user.role);

  //   // =========================
  //   // 4. DISTANCE FILTER
  //   // =========================
  //   candidates = candidates.filter((c) => (c.score ?? 1) <= ragConfig.distanceThreshold);

  //   // =========================
  //   // 5. FALLBACK LEVEL 1
  //   // =========================
  //   if (!candidates.length) {
  //     return {
  //       answer: 'Không tìm thấy thông tin liên quan.',
  //       sources: [],
  //     };
  //   }

  //   // =========================
  //   // 6. RERANKER
  //   // =========================
  //   const reranked = this.reranker.rerank(question, candidates);

  //   const topDocs = reranked.slice(0, ragConfig.finalTopK);

  //   // =========================
  //   // 7. CONTEXT BUILDING
  //   // =========================
  //   const context = topDocs.map((d, i) => `[${i + 1}] ${d.content}`).join('\n\n');

  //   // =========================
  //   // 8. LLM
  //   // =========================
  //   const prompt = `
  //                     Bạn là trợ lý AI cho hệ thống e-commerce.

  //                     Chỉ sử dụng context bên dưới.
  //                     Nếu không đủ thông tin → nói "không tìm thấy thông tin".

  //                     Context:
  //                     ${context}

  //                     Question:
  //                     ${question}

  //                     Answer:
  //                   `;

  //   const response = await this.llm.invoke(prompt);

  //   return {
  //     answer: response.content,
  //     sources: topDocs.map((d) => d.metadata),
  //   };
  // }

  /**
   * Dùng để test
   */
  async test() {
    return await this.aiService.embeddings.embedQuery('hello');
  }
}
