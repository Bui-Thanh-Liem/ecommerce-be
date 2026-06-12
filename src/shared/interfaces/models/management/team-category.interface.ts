import { TeamCategoryCode } from '@/shared/enums/team-category-code.enum';
import { TeamType } from '@/shared/enums/team-type.enum';
import { ITeam } from './team.interface';
import { IBase } from '../../common/base.interface';

export interface ITeamCategory extends IBase {
  name: string;
  type: TeamType;
  code: TeamCategoryCode;

  // Relations
  teams: ITeam[];
}
