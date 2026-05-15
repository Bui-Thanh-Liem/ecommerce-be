import { createQueryDto } from '@/shared/dtos/query.dto';

class RoleFilterDto {}

export class RoleQueryDto extends createQueryDto(RoleFilterDto) {}
