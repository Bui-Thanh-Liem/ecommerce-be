import { createQueryDto } from '@/shared/dtos/req/query.dto';

class PromotionFilterDto {}

export class PromotionQueryDto extends createQueryDto(PromotionFilterDto) {}
