import { createQueryDto } from '@/shared/dtos/req/query.dto';

class TeamCategoryFilterDto {}

export class TeamCategoryQueryDto extends createQueryDto(TeamCategoryFilterDto) {}
