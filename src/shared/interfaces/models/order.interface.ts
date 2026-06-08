import { OrderStatus } from '@/shared/enums/order-status.enum';
import { IBase } from '../common/base.interface';
import { OrderPaymentMethod } from '@/shared/enums/order-payment-method.enum';

export interface IOrder extends IBase {
  id: string;
  customerId: string;
  productIds: string[];
  totalAmount: number;
  paymentMethod: OrderPaymentMethod;
  orderDate: Date;
  status: OrderStatus;
  shoppingAddress: string;
}
