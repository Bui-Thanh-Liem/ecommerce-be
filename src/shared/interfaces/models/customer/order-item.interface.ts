import { IBase } from '../../common/base.interface';
import { IProductVariant } from '../catalog/product-variant.interface';
import { IOrder } from './order.interface';

export interface IOrderItem extends IBase {
  order: IOrder;
  price: number;
  quantity: number;
  product: IProductVariant;
}
