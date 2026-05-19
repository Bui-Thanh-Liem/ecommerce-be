import { createQueryDto } from '@/shared/dtos/req/query.dto';

class StoreFilterDto {}

export class StoreQueryDto extends createQueryDto(StoreFilterDto) {}
