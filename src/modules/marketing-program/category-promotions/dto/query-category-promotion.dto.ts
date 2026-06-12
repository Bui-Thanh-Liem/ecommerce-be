import { createQueryDto } from '@/shared/dtos/req/query.dto';

class CategoryPromotionFilterDto {}

export class CategoryPromotionQueryDto extends createQueryDto(CategoryPromotionFilterDto) {}
