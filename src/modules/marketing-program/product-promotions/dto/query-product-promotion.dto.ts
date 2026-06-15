import { createQueryDto } from '@/shared/dtos/req/query.dto';
import { IsOptional, IsUUID } from 'class-validator';

class ProductPromotionFilterDto {
  @IsOptional()
  @IsUUID('4')
  promotion?: string;
}

export class ProductPromotionQueryDto extends createQueryDto(ProductPromotionFilterDto) {}
