import { createQueryDto } from '@/shared/dtos/req/query.dto';

class PopularSearchFilterDto {}

export class PopularSearchQueryDto extends createQueryDto(PopularSearchFilterDto) {}
