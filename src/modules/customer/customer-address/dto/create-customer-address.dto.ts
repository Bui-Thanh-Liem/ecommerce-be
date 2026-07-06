import { IsString, IsUUID } from 'class-validator';

export class CreateCustomerAddressDto {
  @IsUUID('4')
  customer: string;

  @IsUUID('4')
  country: string;

  @IsUUID('4')
  city: string;

  @IsUUID('4')
  district: string;

  @IsUUID('4')
  ward: string;

  @IsString()
  address: string;

  @IsString()
  recipientName: string;

  @IsString()
  recipientPhone: string;
}
