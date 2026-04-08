import { IBase } from '../base.interface';

export interface ICustomer extends IBase {
  fullname: string;
  phone: string;
  address: string[];
}
