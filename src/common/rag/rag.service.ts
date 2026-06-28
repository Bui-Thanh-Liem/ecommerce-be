import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Document } from '@langchain/core/documents';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

import { DocumentEntity } from './document.entity';
import { pgConfig } from '@/configs/pg.config';

@Injectable()
export class RagService implements OnModuleInit {
  private readonly logger = new Logger(RagService.name);

  private vectorStore: PGVectorStore;
  private embeddings: GoogleGenerativeAIEmbeddings;
  private llm: ChatGoogleGenerativeAI;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(DocumentEntity)
    private readonly documentRepo: Repository<DocumentEntity>,
  ) {}

  async onModuleInit() {
    // Model embedding của Gemini: text-embedding-004 → vector 768 chiều
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: this.config.get<string>('GEMINI_API_KEY'),
      model: 'text-embedding-004',
    });

    // Model chat dùng để tổng hợp câu trả lời cuối cùng
    this.llm = new ChatGoogleGenerativeAI({
      apiKey: this.config.get<string>('GEMINI_API_KEY'),
      model: 'gemini-2.0-flash',
      temperature: 0.2,
    });

    // PGVectorStore tự bật extension "vector" và tự tạo bảng
    // "document_chunks" nếu chưa tồn tại — không cần migration tay.
    this.vectorStore = await PGVectorStore.initialize(this.embeddings, {
      postgresConnectionOptions: pgConfig,
      tableName: 'document_chunks',
      columns: {
        idColumnName: 'id',
        vectorColumnName: 'embedding',
        contentColumnName: 'content',
        metadataColumnName: 'metadata',
      },
      distanceStrategy: 'cosine',
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
   * nhồi vào prompt, rồi gọi Gemini để tổng hợp câu trả lời.
   */
  async ask(question: string) {
    const relevantDocs = await this.vectorStore.similaritySearch(question, 4);

    const context = relevantDocs.map((doc, i) => `[Đoạn ${i + 1}] ${doc.pageContent}`).join('\n\n');

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
      sources: relevantDocs.map((doc) => doc.metadata),
    };
  }
}
