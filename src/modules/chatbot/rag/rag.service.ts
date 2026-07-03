import { BadRequestException, Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PGVectorStore, PGVectorStoreArgs } from '@langchain/community/vectorstores/pgvector';
import { Document, DocumentInterface } from '@langchain/core/documents';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { TextLoader } from '@langchain/classic/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { QueryRouterService } from './query-router.service';
import { RbacService } from './rbac.service';
import { HybridSearchService } from './hybrid-search.service';
import { ReRankerService } from './reranker.service';
import { AiService } from '../../../common/ai/ai.service';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { type DocumentType } from '../document/document.type';
import { DocumentService } from '../document/document.service';
import { ProductVariantsService } from '@/modules/catalog/product-variants-SKU/product-variants.service';
import { ProductVariantRagStatus } from '@/shared/enums/product-variant-rag-status.enum';
import { IngestVariantDto } from './dto/ingest-variant.dto';
import { v5 as uuidv5 } from 'uuid';
import { ChatHistoryService } from '../chat-history/chat-history.service';
import { PromptService } from './prompt.service';
import { IngestDocumentDto } from '../document/dto/ingest.dto';

/**
 * distanceStrategy: Chiến lược tính khoảng cách giữa các vector embedding. Có thể là:
 * - 'cosine': Khoảng cách cosine (cosine similarity) (cùng hướng → 1, ngược hướng → -1)
 * - 'euclidean': Khoảng cách Euclidean (khoảng cách hình học)
 * - 'inner_product': Tích vô hướng (inner product)
 *
 * dimensions: Số chiều của vector embedding. Ví dụ, Gemini Embeddings có 1024 chiều.
 */

type GeneralVectorStore = Omit<PGVectorStoreArgs & { dimensions?: number }, 'tableName'>;

interface SourceItem {
  skuId: string;
  sku?: string;
  name?: string;
}

@Injectable()
export class RagService implements OnModuleInit {
  private readonly logger = new Logger(RagService.name);
  private vectorDocumentInternalStore: PGVectorStore;
  private vectorDocumentPublicStore: PGVectorStore;

  constructor(
    private aiService: AiService,

    private readonly configService: ConfigService,

    private documentService: DocumentService,

    private variantService: ProductVariantsService,

    private readonly chatHistoryService: ChatHistoryService,

    private readonly promptService: PromptService,

    private readonly router: QueryRouterService,
    private readonly rbac: RbacService,
    private readonly hybrid: HybridSearchService,
    private readonly reRanker: ReRankerService,
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
    this.vectorDocumentInternalStore = await PGVectorStore.initialize(this.aiService.embeddings, {
      ...generalVectorStore,
      tableName: 'document_internal_chunks',
    });
    this.logger.log('PGVectorStore (Gemini embeddings) đã sẵn sàng');

    //
    this.vectorDocumentPublicStore = await PGVectorStore.initialize(this.aiService.embeddings, {
      ...generalVectorStore,
      tableName: 'document_public_chunks',
    });
    this.logger.log('PGVectorStore (Gemini embeddings) đã sẵn sàng');
  }

  /**
   * Nạp file
   * -> trích xuất text -> chia nhỏ -> tạo vector -> Lưu metadata qua TypeORM -> lưu vào Postgres.
   */
  async ingestDocument(payload: IngestDocumentDto) {
    const { type, originalname, filePath } = payload;

    // 1. Lưu thông tin metadata (tên file, trạng thái)
    const docRecord = await this.documentService.create({ payload, status: 'processing' });

    try {
      // 2. Trích xuất text từ file
      const loader = await this.getLoaderByFileExtension(filePath);
      const rawDocs = await loader.load();

      // 3. Chia nhỏ text thành các chunk (với chunkSize = 1000, chunkOverlap = 150)
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 150,
      });
      const chunks = await splitter.splitDocuments(rawDocs);

      // 4. Tạo vector embedding cho từng chunk và lưu vào Postgres
      const chunksWithMetadata = chunks.map(
        (chunk) =>
          new Document({
            pageContent: chunk.pageContent,
            metadata: {
              ...chunk.metadata,
              ...payload,
              documentId: docRecord.id,
            },
          }),
      );

      // 5. Lưu các chunk đã tạo vector vào PGVectorStore
      if (type === 'internal') {
        await this.vectorDocumentInternalStore.addDocuments(chunksWithMetadata);
      } else {
        await this.vectorDocumentPublicStore.addDocuments(chunksWithMetadata);
      }

      // 6. Cập nhật trạng thái và số chunk vào metadata
      docRecord.status = 'ready';
      docRecord.chunkCount = chunksWithMetadata.length;

      // 7. Cập nhật metadata vào database
      return await this.documentService.changeStatus(
        docRecord.id,
        { status: 'ready', chunkCount: chunksWithMetadata.length },
        type,
      );
    } catch (error) {
      docRecord.status = 'failed';
      await this.documentService.changeStatus(docRecord.id, { status: 'failed' }, type);
      this.logger.error(`Lỗi khi nạp file ${originalname}`, error as Error);
      throw error;
    }
  }

  /**
   * Nạp thông tin của Product Variant (SKU) vừa mới tạo/cập nhật
   * -> tạo vector -> cập nhật ProductVariantEntity.ragStatus = true -> lưu vào Postgres.
   * Hàm này sẽ thực thi ở bull, rồi tại service ProductVariantsService sẽ addQueue
   */
  async ingestProductVariant(variant: IngestVariantDto, type: DocumentType) {
    const product = variant?.product;

    // 1. Cập nhật trạng thái
    await this.variantService.changeRagStatus(variant.id, ProductVariantRagStatus.INGESTING);

    //
    const metadata: SourceItem = { skuId: variant.id, sku: variant.sku, name: product?.name };
    const salesAttributes = variant.salesAttributes.map((attr) => `- ${attr.label}: ${attr.desc}`).join('\n');
    const pageContent = `Tên sản phẩm: ${product.name}
    Mã SKU: ${variant.sku}
    Giá: ${variant.price}đ
    Danh mục: ${product.category?.name}
    Thương hiệu: ${product.brand?.name}

    Các thuộc tính bán hàng:
    ${salesAttributes}`;

    try {
      // 2. Tạo vector embedding cho SKU
      const chunksWithMetadata = [new Document({ pageContent, metadata })];

      // 3. Lưu các chunk đã tạo vector vào PGVectorStore
      if (type === 'internal') {
        const id = this.buildDeterministicId(variant.id, 'internal');
        await this.vectorDocumentInternalStore.delete({ ids: [id] });
        await this.vectorDocumentInternalStore.addDocuments(chunksWithMetadata, { ids: [id] });
      } else {
        const internalId = this.buildDeterministicId(variant.id, 'internal');
        const publicId = this.buildDeterministicId(variant.id, 'public');

        await Promise.all([
          this.vectorDocumentInternalStore.delete({ ids: [internalId] }),
          this.vectorDocumentPublicStore.delete({ ids: [publicId] }),
        ]);

        await Promise.all([
          this.vectorDocumentInternalStore.addDocuments(chunksWithMetadata, { ids: [internalId] }),
          this.vectorDocumentPublicStore.addDocuments(chunksWithMetadata, { ids: [publicId] }),
        ]);
      }

      // 4. Cập nhật trạng thái và số chunk vào metadata
      return await this.variantService.changeRagStatus(variant.id, ProductVariantRagStatus.INGESTED);
    } catch (error) {
      await this.variantService.changeRagStatus(variant.id, ProductVariantRagStatus.INGESTED);
      this.logger.error(`Lỗi khi nạp SKU ${variant.sku}`, error as Error);
      throw error;
    }
  }

  /**
   * Xoá embedding của 1 variant khỏi cả 2 vector store, dùng khi variant bị xoá
   * khỏi hệ thống chính - tránh dữ liệu "ma" còn sót lại trong RAG.
   */
  async removeVariantFromRag(variantId: string | number) {
    const internalId = this.buildDeterministicId(variantId, 'internal');
    const publicId = this.buildDeterministicId(variantId, 'public');

    await Promise.all([
      this.vectorDocumentInternalStore.delete({ ids: [internalId] }),
      this.vectorDocumentPublicStore.delete({ ids: [publicId] }),
    ]);
  }

  /**
   * Đặt câu hỏi và nhận câu trả lời từ hệ thống, có lưu + nạp lại lịch sử hội thoại
   * qua RunnableWithMessageHistory (chuẩn LangChain hiện tại, thay cho các class
   * Memory cũ đã deprecated).
   *
   * @param conversationId id phiên hội thoại. Không truyền -> tự sinh mới (coi
   *                        như lần đầu chat, chưa có lịch sử).
   */
  async *ask(
    question: string,
    type: DocumentType = 'public',
    conversationId: string,
  ): AsyncGenerator<string, void, unknown> {
    console.log('question :::', question);

    try {
      const topK = 4;
      const distanceThreshold = 0.8; // phải tuỳ theo model embed
      const isInternal = type === 'internal';

      // Đối với similaritySearchWithScore()
      // - Trả về [Document, score].
      // - Với distanceStrategy = 'cosine', score là Cosine Distance.
      // - Distance càng gần 0 => document càng liên quan.
      // - Có thể filter theo distanceThreshold trước khi đưa cho LLM.
      // 1. Lấy các document liên quan từ PGVectorStore

      const relevantDocs: [Document, number][] = [];
      if (isInternal) {
        relevantDocs.push(
          ...(await this.vectorDocumentPublicStore.similaritySearchWithScore(question, topK)),
          ...(await this.vectorDocumentInternalStore.similaritySearchWithScore(question, topK)),
        );
      } else {
        relevantDocs.push(...(await this.vectorDocumentPublicStore.similaritySearchWithScore(question, topK)));
      }
      console.log('relevantDocs :::', relevantDocs);

      // Đối với similaritySearch()
      // - Chỉ lấy Top K document gần nhất.
      // - Không trả về score nên không biết document nào thực sự liên quan.
      // - Phù hợp khi luôn muốn đưa Top K document cho LLM.
      // const relevantDocs = await this.vectorStore.similaritySearch(question, topK);

      // Lọc các document có score < distanceThreshold
      // 2. Lọc các document có score < distanceThreshold
      const docs: DocumentInterface<Record<string, any>>[] = [];
      for (const [doc, score] of relevantDocs) {
        if (score < distanceThreshold) {
          docs.push(doc);
        }
      }

      console.log('Filtered Docs :::', docs);

      const context = docs.map((doc, i) => `[Đoạn ${i + 1}] ${doc.pageContent}`).join('\n\n');

      const publicPrompt = this.promptService.generatePublicPrompt(context, question);
      const internalPrompt = this.promptService.generateInternalPrompt(context, question);

      // 3. Tạo prompt template và stream dữ liệu từ LLM
      const promptTemplate = ChatPromptTemplate.fromMessages([
        ['system', isInternal ? internalPrompt : publicPrompt],
        new MessagesPlaceholder('history'),
        ['human', '{input}'],
      ]);

      // 4. Tạo chain và stream dữ liệu từ LLM
      const history = await this.chatHistoryService.getRecentMessages(conversationId, 12); // Lấy 12 message gần nhất
      console.log('history :::', history);
      const chain = promptTemplate.pipe(this.aiService.model);
      const stream = await chain.stream({
        history,
        input: question,
      });

      // 5. Stream dữ liệu về client theo thời gian thực
      //
      yield JSON.stringify({
        type: 'sources',
        data: docs.map((d) => d.metadata),
      });
      yield JSON.stringify({ type: 'start_answer' });

      //
      let fullAnswer = '';
      for await (const chunk of stream) {
        const content = chunk.content as string;
        if (!content) continue; // không stream khi model reasoning
        fullAnswer += content;
        yield JSON.stringify({ type: 'answer_chunk', content });
      }

      //
      await this.chatHistoryService.appendHuman(conversationId, question);
      await this.chatHistoryService.appendAi(conversationId, fullAnswer);

      //
      yield JSON.stringify({ type: 'end' });
    } catch (error) {
      this.logger.error(`Lỗi khi hỏi: ${question}`, error as Error);
      yield JSON.stringify({ type: 'error', content: 'Có lỗi xảy ra' });
    }
  }

  /**
   *
   */
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
   * -
   */
  async test() {
    return await this.aiService.embeddings.embedQuery('hello');
  }

  private async getLoaderByFileExtension(filePath: string) {
    const extension = filePath.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return new PDFLoader(filePath);
      case 'docx':
        return new DocxLoader(filePath);
      case 'csv':
        return new CSVLoader(filePath);
      case 'txt':
        return new TextLoader(filePath);
      default: {
        await this.documentService.removeFile(filePath); // Xóa file nếu không hỗ trợ
        throw new BadRequestException(`Unsupported file extension: ${extension}`);
      }
    }
  }

  private buildDeterministicId(variantId: string | number, scope: 'internal' | 'public'): string {
    const RAG_ID_NAMESPACE = 'a3f1c2d4-5b6e-4f7a-8c9d-0e1f2a3b4c5d'; // UUID namespace for deterministic ID generation
    return uuidv5(`variant:${variantId}:${scope}`, RAG_ID_NAMESPACE);
  }
}
