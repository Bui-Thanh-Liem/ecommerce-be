import { PaymentGateway } from '@/shared/enums/order-payment-gateway.enum';
import { PaymentMethod } from '@/shared/enums/payment-method.enum';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from 'class-validator';
import { CreateOrderItemDto } from '../../order-items/dto/create-order-item.dto';

export class CreateOrderDto {
  @ArrayNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  orderItems: CreateOrderItemDto[];

  @IsNumber()
  @Min(1000, { message: 'Số tiền tối thiểu là 1000 VND' })
  totalAmount: number;

  @IsEnum(PaymentGateway)
  paymentGateway: PaymentGateway;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsNotEmpty()
  @IsString()
  shoppingAddress: string;
}
