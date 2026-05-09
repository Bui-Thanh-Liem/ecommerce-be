import { StaffWorkLocationID } from '@/shared/enums/staff-work-location-id.enum';
import { IBase } from '../base.interface';
import { IRole } from './role.interface';
import { IStore } from './store.interface';
import { ITeam } from './team.interface';

export interface IStaff extends IBase {
  avatarUrl?: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  isSubAdmin: boolean;
  isStoreAdmin: boolean;
  roles: IRole[];
  store: IStore | null; // superAdmin thì null
  managedStore?: IStore; // Store mà Staff này quản lý (nếu có)
  teamMemberships?: ITeam[];
  teamsLed?: ITeam[];
  directManager: IStaff; // Quản lý trực tiếp của nhân viên
  // eslint-disable-next-line max-len
  workLocationID: StaffWorkLocationID;
}
