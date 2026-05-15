import { createQueryDto } from '@/shared/dtos/query.dto';

class BrandFilterDto {}

export class BrandQueryDto extends createQueryDto(BrandFilterDto) {}
