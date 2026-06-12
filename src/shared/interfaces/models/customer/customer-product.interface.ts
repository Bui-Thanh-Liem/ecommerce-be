import { CustomerProductType } from '@/shared/enums/customer-product-type.enum';
import { IBase } from '../../common/base.interface';
import { ICustomer } from './customer.interface';
import { IProductVariant } from '../catalog/product-variant.interface';

export interface ICustomerProduct extends IBase {
  customer?: ICustomer;
  session?: string; // Guest session ID, có thể null nếu là user đã đăng nhập
  type: CustomerProductType;
  productVariant: IProductVariant;
}
