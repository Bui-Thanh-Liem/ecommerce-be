import { createQueryDto } from '@/shared/dtos/req/query.dto';

class BrandFilterDto {}

export class BrandQueryDto extends createQueryDto(BrandFilterDto) {}
