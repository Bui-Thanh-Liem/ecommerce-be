import { IBase } from '../base.interface';
import { IRole } from './role.interface';
import { IStore } from './store.interface';
import { ITeam } from './team.interface';

export interface IStaff extends IBase {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  isStoreAdmin: boolean;
  roles: IRole[];
  store: IStore | null; // superAdmin thì null
  managedStore?: IStore;
  teamMemberships?: ITeam[];
  teamsLed?: ITeam[];
}
