import { createQueryDto } from '@/shared/dtos/req/query.dto';

class AuditLogFilterDto {}

export class AuditLogQueryDto extends createQueryDto(AuditLogFilterDto) {}
