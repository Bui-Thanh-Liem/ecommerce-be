import { CustomerProductType } from '@/shared/enums/customer-product-type.enum';
import { IBase } from '../base.interface';
import { ICustomer } from './customer.interface';
import { IProductVariant } from './product-variant.interface';

export interface ICustomerProduct extends IBase {
  customer: ICustomer;
  type: CustomerProductType;
  productVariant: IProductVariant;
}
