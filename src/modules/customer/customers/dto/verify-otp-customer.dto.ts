import { Trim } from '@/decorators/trim.decorator';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { LoginCustomerDto } from './login-customer.dto';

export class VerifyOtpCustomerDto extends LoginCustomerDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(6)
  otp: string;
}
