import { Injectable } from '@nestjs/common';
import { DocumentType } from '../document/document.type';

const publicRoutes = [
  { keywords: ['bảo hành', 'đổi trả'], scopes: ['policy'] },
  { keywords: ['giá', 'laptop', 'điện thoại'], scopes: ['product'] },
];

const internalRoutes = [
  { keywords: ['sku'], scopes: ['inventory'] },
  { keywords: ['đơn hàng'], scopes: ['order'] },
];

@Injectable()
export class QueryRouterService {
  route(question: string, type: DocumentType): string[] {
    const q = question.toLowerCase();

    // PUBLIC ROUTES
    if (type === 'public') {
      for (const route of publicRoutes) {
        if (route.keywords.some((kw) => q.includes(kw))) {
          return route.scopes;
        }
      }

      return ['faq', 'product'];
    }

    // INTERNAL ROUTES
    if (type === 'internal') {
      for (const route of internalRoutes) {
        if (route.keywords.some((kw) => q.includes(kw))) {
          return route.scopes;
        }
      }

      return ['product', 'inventory'];
    }

    return ['product', 'faq'];
  }
}
