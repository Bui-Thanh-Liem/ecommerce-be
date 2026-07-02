import { Injectable } from '@nestjs/common';
import { RAGDocument } from './role.type';
import { DocumentType } from '../document/document.type';

@Injectable()
export class RbacService {
  private permissions: Record<DocumentType, string[]> = {
    public: ['product', 'faq', 'policy'],
    internal: ['*'],
  };

  filter(docs: RAGDocument[], role: DocumentType) {
    const allowed = this.permissions[role];

    if (allowed.includes('*')) return docs;

    return docs.filter((d) => allowed.includes(d.metadata.scope));
  }
}
