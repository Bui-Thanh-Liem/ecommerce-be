import { createQueryDto } from '@/shared/dtos/req/query.dto';
import { IsOptional, IsString, MaxLength } from 'class-validator';

class ProductFilterDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;
}

export class ProductQueryDto extends createQueryDto(ProductFilterDto) {}
