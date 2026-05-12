import { createQueryDto } from '@/shared/dtos/query.dto';

class QueryFilterDto {}

export class LocationRegionQueryDto extends createQueryDto(QueryFilterDto) {}
