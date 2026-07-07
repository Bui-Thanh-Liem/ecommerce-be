import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { Expose, Type } from 'class-transformer';
import { CustomerDto } from '../../customers/dto/customer.dto';
import { PaymentGateway } from '@/shared/enums/order-payment-gateway.enum';
import { PaymentMethod } from '@/shared/enums/payment-method.enum';
import { OrderStatus } from '@/shared/enums/order-status.enum';
import { OrderItemDto } from '../../order-items/dto/order-item.dto';

export class OrderDto extends SerializerDto {
  @Expose()
  customer: CustomerDto;

  @Expose()
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];

  @Expose()
  totalAmount: number;

  @Expose()
  paymentGateway: PaymentGateway;

  @Expose()
  paymentMethod: PaymentMethod;

  @Expose()
  status: OrderStatus;

  @Expose()
  invoiceNumber: string;

  @Expose()
  shoppingAddress: string;
}
