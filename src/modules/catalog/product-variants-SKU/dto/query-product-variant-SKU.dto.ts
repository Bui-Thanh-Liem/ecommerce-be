import { createQueryDto } from '@/shared/dtos/req/query.dto';

class ProductVariantFilterDto {}

export class ProductVariantQueryDto extends createQueryDto(ProductVariantFilterDto) {}
