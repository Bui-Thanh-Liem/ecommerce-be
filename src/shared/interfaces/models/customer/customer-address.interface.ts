import { IBase } from '../../common/base.interface';
import { ILocationRegion } from '../inventory/location-region.interface';
import { ICustomer } from './customer.interface';

export interface ICustomerAddress extends IBase {
  customer: ICustomer;
  country: ILocationRegion;
  city: ILocationRegion;
  district: ILocationRegion;
  ward: ILocationRegion;
  address: string;
  isDefault: boolean;
}
