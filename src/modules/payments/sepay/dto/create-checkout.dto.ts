import { IsEnum, IsNumber, IsString, IsUUID, Min } from 'class-validator';
import { PaymentMethod } from '../../../../shared/enums/payment-method.enum';

export class CreateCheckoutDto {
  @IsUUID('4')
  order: string;

  @IsNumber()
  @Min(1000, { message: 'Số tiền tối thiểu là 1000 VND' })
  amount: number;

  @IsString()
  description: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
