import { TeamStatus } from '@/shared/enums/team-status.enum';
import { IBase } from '../base.interface';
import { IStaff } from './staff.interface';
import { IStore } from './store.interface';

export interface ITeam extends IBase {
  name: string;
  desc: string;
  leader: IStaff;
  members: IStaff[];
  store: IStore;
  status: TeamStatus;
}
