import { Injectable } from '@nestjs/common';
import { Role } from './role.type';

const customerRoutes = [
  { keywords: ['bảo hành', 'đổi trả'], scopes: ['policy'] },
  { keywords: ['giá', 'laptop', 'điện thoại'], scopes: ['product'] },
];

const staffRoutes = [
  { keywords: ['sku'], scopes: ['inventory'] },
  { keywords: ['đơn hàng'], scopes: ['order'] },
];

@Injectable()
export class QueryRouterService {
  route(question: string, role: Role): string[] {
    const q = question.toLowerCase();

    // CUSTOMER ROUTES
    if (role === 'customer') {
      for (const route of customerRoutes) {
        if (route.keywords.some((kw) => q.includes(kw))) {
          return route.scopes;
        }
      }

      return ['faq', 'product'];
    }

    // STAFF ROUTES
    if (role === 'staff') {
      for (const route of staffRoutes) {
        if (route.keywords.some((kw) => q.includes(kw))) {
          return route.scopes;
        }
      }

      return ['product', 'inventory'];
    }

    return ['product', 'faq'];
  }
}
