import { Trim } from '@/decorators/trim.decorator';
import { IsArray, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  fullname: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]{7,15}$/, { message: 'Phone number must be valid' })
  phone: string;

  @IsOptional()
  @IsArray()
  address: string[];
}
