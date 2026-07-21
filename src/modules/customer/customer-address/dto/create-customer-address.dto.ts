import { Trim } from '@/decorators/trim.decorator';
import { IsBoolean, IsNotEmpty, IsString, IsUUID, Matches, MaxLength } from 'class-validator';

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
  @Trim()
  @MaxLength(50)
  recipientName: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^\+?[0-9]{7,15}$/, { message: 'Phone number must be valid' })
  recipientPhone: string;

  @IsBoolean()
  isDefault?: boolean;
}
