import { PaymentGateway } from '@/shared/enums/order-payment-gateway.enum';
import { PaymentMethod } from '@/shared/enums/payment-method.enum';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateOrderItemDto } from '../../order-items/dto/create-order-item.dto';
import { Trim } from '@/decorators/trim.decorator';

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

  @IsString()
  shoppingAddress: string;

  @IsString()
  @Trim()
  @MaxLength(50)
  recipientName: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^\+?[0-9]{7,15}$/, { message: 'Phone number must be valid' })
  recipientPhone: string;
}
