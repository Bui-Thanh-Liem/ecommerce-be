import { createQueryDto } from '@/shared/dtos/query.dto';

class ProductFilterDto {}

export class ProductQueryDto extends createQueryDto(ProductFilterDto) {}
