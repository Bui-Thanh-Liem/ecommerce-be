import { Injectable } from '@nestjs/common';
import { RAGDocument, Role } from './role.type';

@Injectable()
export class RbacService {
  private permissions: Record<Role, string[]> = {
    customer: ['product', 'faq', 'policy'],
    staff: ['product', 'faq', 'policy', 'inventory', 'order'],
    admin: ['*'],
    subAdmin: ['*'],
  };

  filter(docs: RAGDocument[], role: Role) {
    const allowed = this.permissions[role];

    if (allowed.includes('*')) return docs;

    return docs.filter((d) => allowed.includes(d.metadata.scope));
  }
}
