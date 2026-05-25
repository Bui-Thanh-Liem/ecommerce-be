import { TeamCategoryCode } from '@/shared/enums/team-category-code.enum';
import { TeamType } from '@/shared/enums/team-type.enum';
import { Expose } from 'class-transformer';

export class TeamCategoryDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  code: TeamCategoryCode;

  @Expose()
  type: TeamType;
}
