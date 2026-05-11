import { IBase } from '../base.interface';
import { TeamCategoryCode } from '@/shared/enums/team-category-code.enum';
import { ITeam } from './team.interface';
import { TeamType } from '@/shared/enums/team-type.enum';

export interface ITeamCategory extends IBase {
  name: string;
  type: TeamType;
  code: TeamCategoryCode;

  // Relations
  teams: ITeam[];
}
