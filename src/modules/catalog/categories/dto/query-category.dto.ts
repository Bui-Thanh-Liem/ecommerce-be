import { createQueryDto } from '@/shared/dtos/req/query.dto';
import { IsOptional, IsString, MaxLength } from 'class-validator';

class CategoryFilterDto {
  @IsOptional()
  @IsString()
  parent?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;
}

export class CategoryQueryDto extends createQueryDto(CategoryFilterDto) {}
