import { createQueryDto } from '@/shared/dtos/req/query.dto';

class ProductItemFilterDto {}

export class ProductItemQueryDto extends createQueryDto(ProductItemFilterDto) {}
