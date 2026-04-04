import { IBase } from '../base.interface';
import { IStore } from './store.interface';

export interface IStaff extends IBase {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  roles: string[];
  isActive: boolean;
  isAdmin: boolean;
  store: IStore | null; // superAdmin thì null
}
