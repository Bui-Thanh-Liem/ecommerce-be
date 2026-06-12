import { createQueryDto } from '@/shared/dtos/req/query.dto';

class MktProgramFilterDto {}

export class MktProgramQueryDto extends createQueryDto(MktProgramFilterDto) {}
