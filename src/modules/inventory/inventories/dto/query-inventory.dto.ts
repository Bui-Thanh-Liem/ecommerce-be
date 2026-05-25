import { createQueryDto } from '@/shared/dtos/req/query.dto';

class InventoryFilterDto {}

export class InventoryQueryDto extends createQueryDto(InventoryFilterDto) {}
