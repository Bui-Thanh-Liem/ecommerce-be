import { createQueryDto } from '@/shared/dtos/req/query.dto';

class CustomerFilterDto {}

export class CustomerQueryDto extends createQueryDto(CustomerFilterDto) {}
