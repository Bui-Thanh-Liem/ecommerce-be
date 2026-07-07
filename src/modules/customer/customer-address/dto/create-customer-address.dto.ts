import { IsBoolean, IsString, IsUUID } from 'class-validator';

export class CreateCustomerAddressDto {
  @IsUUID('4')
  country: string;

  @IsUUID('4')
  provinceCity: string;

  @IsUUID('4')
  districtTown: string;

  @IsUUID('4')
  wardCommune: string;

  @IsString()
  address: string;

  @IsString()
  recipientName: string;

  @IsString()
  recipientPhone: string;

  @IsBoolean()
  isDefault?: boolean;
}
