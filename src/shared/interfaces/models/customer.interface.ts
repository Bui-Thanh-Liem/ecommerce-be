import { IBase } from '../base.interface';
import { IRating } from './rating.inetrface';

export interface ICustomer extends IBase {
  fullname: string;
  phone: string;
  address: string[];

  // Quan hệ với các entity khác
  ratings?: IRating[];
}
