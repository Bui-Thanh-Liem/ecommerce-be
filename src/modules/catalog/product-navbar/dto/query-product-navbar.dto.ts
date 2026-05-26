import { createQueryDto } from '@/shared/dtos/req/query.dto';

class ProductNavbarFilterDto {}

export class ProductNavbarQueryDto extends createQueryDto(ProductNavbarFilterDto) {}
