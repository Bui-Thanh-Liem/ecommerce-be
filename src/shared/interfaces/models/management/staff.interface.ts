import { StaffWorkLocationID } from '@/shared/enums/staff-work-location-id.enum';
import { IBase } from '../../common/base.interface';
import { IImage } from '../../common/image.interface';
import { IRole } from './role.interface';
import { IStore } from '../inventory/store.interface';
import { ITeam } from './team.interface';

export interface IStaff extends IBase {
  avatar?: IImage;
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
  workLocationID: StaffWorkLocationID;
}
