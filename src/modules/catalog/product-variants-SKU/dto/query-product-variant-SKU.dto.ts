import { Trim } from '@/decorators/trim.decorator';
import { SORT_OPTIONS } from '@/shared/constants/sort-option.constant';
import { createQueryDto } from '@/shared/dtos/req/query.dto';
import { IsIn, IsOptional, IsString } from 'class-validator';

class ProductVariantFilterDto {
  @IsOptional()
  @IsString()
  @Trim()
  b?: string; // Brand slug

  @IsOptional()
  @Trim()
  @IsString()
  @IsIn(SORT_OPTIONS, { message: 'Sort invalid' })
  s: (typeof SORT_OPTIONS)[number];
}

export class ProductVariantQueryDto extends createQueryDto(ProductVariantFilterDto) {}
