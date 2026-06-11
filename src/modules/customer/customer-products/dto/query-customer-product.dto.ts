import { createQueryDto } from '@/shared/dtos/req/query.dto';

class CustomerProductFilterDto {}

export class CustomerProductQueryDto extends createQueryDto(CustomerProductFilterDto) {}
