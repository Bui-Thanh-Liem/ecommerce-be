import { Injectable } from '@nestjs/common';
import { RAGDocument } from './role.type';

@Injectable()
export class ReRankerService {
  rerank(query: string, docs: RAGDocument[]): RAGDocument[] {
    const q = query.toLowerCase();

    return docs
      .map((doc) => {
        let score = 0;

        const text = doc.content.toLowerCase();

        const overlap = q.split(' ').filter((t) => text.includes(t)).length;

        score += overlap * 0.2;

        if (text.includes(q)) score += 0.5;

        return { ...doc, score };
      })
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }
}
