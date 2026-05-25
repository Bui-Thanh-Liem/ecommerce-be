import { createQueryDto } from '@/shared/dtos/req/query.dto';

class ProductFilterDto {}

export class ProductQueryDto extends createQueryDto(ProductFilterDto) {}
