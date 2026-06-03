import { Trim } from '@/decorators/trim.decorator';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class LoginCustomerDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^\+?[0-9]{7,15}$/, { message: 'Phone number must be valid' })
  phone: string;
}
