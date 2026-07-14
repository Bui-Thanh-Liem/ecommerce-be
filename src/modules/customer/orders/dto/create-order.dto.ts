import { PaymentGateway } from '@/shared/enums/order-payment-gateway.enum';
import { PaymentMethod } from '@/shared/enums/payment-method.enum';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateOrderItemDto } from '../../order-items/dto/create-order-item.dto';

export class CreateOrderDto {
  @ArrayNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  orderItems: CreateOrderItemDto[];

  @IsNumber()
  totalAmount: number;

  @IsEnum(PaymentGateway)
  paymentGateway: PaymentGateway;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  shoppingAddress: string;
}
