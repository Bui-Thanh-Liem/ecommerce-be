import { IBase } from '../base.interface';
import { ICart } from './cart.interface';
import { IRating } from './rating.interface';

export interface ICustomer extends IBase {
  fullname: string;
  phone: string;
  email?: string;
  address: string[];

  // Relation
  ratings?: IRating[];
  carts?: ICart[];
}
