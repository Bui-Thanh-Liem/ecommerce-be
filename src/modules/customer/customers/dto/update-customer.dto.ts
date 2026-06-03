import { PartialType } from '@nestjs/mapped-types';
import { LoginCustomerDto } from './login-customer.dto';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { Trim } from '@/decorators/trim.decorator';

export class UpdateCustomerDto extends PartialType(LoginCustomerDto) {
  @IsOptional()
  @IsString()
  @Trim()
  @MaxLength(50)
  fullname?: string;

  @IsOptional()
  @IsArray()
  address?: string[];

  @IsOptional()
  @IsString()
  @Trim()
  @MaxLength(100)
  email?: string;
}
