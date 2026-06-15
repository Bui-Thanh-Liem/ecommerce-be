import { createQueryDto } from '@/shared/dtos/req/query.dto';
import { IsOptional, IsUUID } from 'class-validator';

class PromotionFilterDto {
  @IsOptional()
  @IsUUID('4')
  campaign?: string;
}

export class PromotionQueryDto extends createQueryDto(PromotionFilterDto) {}
