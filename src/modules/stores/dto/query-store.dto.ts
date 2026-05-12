import { createQueryDto } from '@/shared/dtos/query.dto';

class StoreFilterDto {}

export class StoreQueryDto extends createQueryDto(StoreFilterDto) {}
