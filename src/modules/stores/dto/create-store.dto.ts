import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { IPhoneStore } from 'src/shared/interfaces/phone-store.interface';

class PhoneStoreDto implements IPhoneStore {
  @MaxLength(50)
  @IsString()
  name: string;

  @MaxLength(20)
  @IsString()
  phone: string;
}

export class CreateStoreDto {
  @IsUUID('4')
  locationRegion: string;

  @MaxLength(100)
  @IsString()
  name: string;

  @MaxLength(200)
  @IsString()
  address: string;

  @MaxLength(10) // Ví dụ: "08:00"
  @IsString()
  openingHours: string;

  @MaxLength(10) // Ví dụ: "22:00"
  @IsString()
  closingHours: string;

  @IsLatitude() // Kiểm tra giá trị latitude hợp lệ
  lat: number;

  @IsLongitude() // Kiểm tra giá trị longitude hợp lệ
  lng: number;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @IsArray() // Kiểm tra xem có phải là một mảng không
  @ValidateNested({ each: true }) // Validate từng object trong mảng
  @Type(() => PhoneStoreDto) // Chỉ định kiểu dữ liệu để transformer hiểu
  phone: PhoneStoreDto[];
}
