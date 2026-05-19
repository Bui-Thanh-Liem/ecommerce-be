import { createQueryDto } from '@/shared/dtos/req/query.dto';

class RoleFilterDto {}

export class RoleQueryDto extends createQueryDto(RoleFilterDto) {}
