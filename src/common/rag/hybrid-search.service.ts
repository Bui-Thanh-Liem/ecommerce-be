import { Injectable } from '@nestjs/common';
import { ragConfig } from './rag.config';
import { RAGDocument } from './role.type';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';

@Injectable()
export class HybridSearchService {
  constructor() {}

  async search(scope: string[], question: string, vectorStore: PGVectorStore) {
    const vectorResults = await vectorStore.similaritySearchWithScore(question, ragConfig.topK);

    const vectorDocs: RAGDocument[] = vectorResults.map(([doc, score]) => ({
      content: doc.pageContent,
      metadata: doc.metadata,
      score,
    }));

    // keyword fallback (simple example)
    const keywordDocs: RAGDocument[] = await this.keywordSearch(question);

    return [...vectorDocs, ...keywordDocs];
  }

  async keywordSearch(question: string): Promise<RAGDocument[]> {
    return []; // implement SQL full-text or ILIKE search
  }
}
