import { IBase } from '../../common/base.interface';
import { ILocationRegion } from '../inventory/location-region.interface';
import { ICustomer } from './customer.interface';

export interface ICustomerAddress extends IBase {
  customer: ICustomer;
  country: ILocationRegion;
  provinceCity: ILocationRegion;
  districtTown: ILocationRegion;
  wardCommune: ILocationRegion;
  address: string;
  recipientName: string;
  recipientPhone: string;
  isDefault: boolean;
}
