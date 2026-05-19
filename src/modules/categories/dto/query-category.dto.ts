import { createQueryDto } from '@/shared/dtos/req/query.dto';
import { IsOptional, IsString } from 'class-validator';

class CategoryFilterDto {
  @IsOptional()
  @IsString()
  parent?: string;
}

export class CategoryQueryDto extends createQueryDto(CategoryFilterDto) {}
