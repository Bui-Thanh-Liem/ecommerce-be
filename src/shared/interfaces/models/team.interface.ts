import { TeamType } from '@/shared/enums/team-type.enum';
import { IBase } from '../base.interface';
import { IStaff } from './staff.interface';
import { IStore } from './store.interface';
import { ITeamCategory } from './team-category.interface';

export interface ITeam extends IBase {
  name: string;
  desc: string;
  type: TeamType;
  leader: IStaff;
  isActive: boolean;
  members: IStaff[];
  store: IStore | null; // Có thể null nếu thuộc Headquarter
  category: ITeamCategory;
}
