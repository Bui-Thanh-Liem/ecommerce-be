import { createQueryDto } from '@/shared/dtos/req/query.dto';

class OrderFilterDto {}

export class OrderQueryDto extends createQueryDto(OrderFilterDto) {}
