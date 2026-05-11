import { createQueryDto } from '@/shared/dtos/query.dto';

class TeamCategoryFilterDto {}

export class TeamCategoryQueryDto extends createQueryDto(TeamCategoryFilterDto) {}
