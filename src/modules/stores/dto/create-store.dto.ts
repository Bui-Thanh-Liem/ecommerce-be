import { Trim } from '@/decorators/trim.decorator';
import { IPhoneStore } from '@/shared/interfaces/phone-store.interface';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class PhoneStoreDto implements IPhoneStore {
  @MaxLength(50)
  @IsString()
  @Trim()
  @IsNotEmpty()
  name: string;

  @MaxLength(20)
  @IsString()
  @IsNotEmpty()
  @Trim()
  phone: string;
}

export class CreateStoreDto {
  @IsUUID('4')
  @IsNotEmpty()
  provinceCity: string;

  @IsUUID('4')
  @IsNotEmpty()
  districtTown: string;

  @IsUUID('4')
  @IsNotEmpty()
  wardCommune: string;

  @MaxLength(200)
  @IsString()
  @Trim()
  @IsNotEmpty()
  address: string;

  @MaxLength(100)
  @IsString()
  @Trim()
  @IsNotEmpty()
  name: string;

  @MaxLength(10) // Ví dụ: "08:00"
  @IsString()
  @Trim()
  @IsNotEmpty()
  openingHours: string;

  @MaxLength(10) // Ví dụ: "22:00"
  @IsString()
  @Trim()
  @IsNotEmpty()
  closingHours: string;

  @IsLatitude() // Kiểm tra giá trị latitude hợp lệ
  @IsNotEmpty()
  lat: number;

  @IsLongitude() // Kiểm tra giá trị longitude hợp lệ
  @IsNotEmpty()
  lng: number;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @IsArray() // Kiểm tra xem có phải là một mảng không
  @ValidateNested({ each: true }) // Validate từng object trong mảng
  @Type(() => PhoneStoreDto) // Chỉ định kiểu dữ liệu để transformer hiểu
  phone: PhoneStoreDto[];

  @IsUUID('4')
  @IsNotEmpty()
  manager: string;
}
