import { createQueryDto } from '@/shared/dtos/req/query.dto';

class ProductPromotionFilterDto {}

export class ProductPromotionQueryDto extends createQueryDto(ProductPromotionFilterDto) {}
