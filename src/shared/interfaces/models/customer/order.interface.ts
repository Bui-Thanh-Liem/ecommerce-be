import { OrderStatus } from '@/shared/enums/order-status.enum';
import { IBase } from '../../common/base.interface';
import { PaymentGateway } from '@/shared/enums/order-payment-gateway.enum';
import { ICustomer } from './customer.interface';
import { IOrderItem } from './order-item.interface';
import { PaymentMethod } from '@/shared/enums/payment-method.enum';

export interface IOrder extends IBase {
  customer: ICustomer;
  totalAmount: number;
  status: OrderStatus;
  invoiceNumber?: string; // Chỉ có giá trị khi đã thanh toán
  shoppingAddress: string;
  paymentGateway: PaymentGateway;
  paymentMethod: PaymentMethod;

  //
  orderItems: IOrderItem[];
}
