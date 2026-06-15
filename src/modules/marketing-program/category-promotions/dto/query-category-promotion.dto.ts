import { createQueryDto } from '@/shared/dtos/req/query.dto';
import { IsOptional, IsUUID } from 'class-validator';

class CategoryPromotionFilterDto {
  @IsOptional()
  @IsUUID('4')
  promotion?: string;
}

export class CategoryPromotionQueryDto extends createQueryDto(CategoryPromotionFilterDto) {}
