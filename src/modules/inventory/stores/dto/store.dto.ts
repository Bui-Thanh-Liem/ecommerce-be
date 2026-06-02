import { ResponseImageDto } from '@/shared/dtos/res/response-image.dto';
import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { Expose, Type } from 'class-transformer';
import { LocationRegionDto } from '../../location-regions/dto/location-region.dto';
import { StaffDto } from '@/modules/management/staffs/dto/staff.dto';

class PhoneStoreDto {
  @Expose()
  name: string;

  @Expose()
  phone: string;
}

export class StoreDto extends SerializerDto {
  @Expose()
  country: LocationRegionDto;

  @Expose()
  provinceCity: LocationRegionDto;

  @Expose()
  districtTown: LocationRegionDto;

  @Expose()
  wardCommune: LocationRegionDto;

  @Expose()
  @Type(() => StaffDto)
  manager: StaffDto;

  @Expose()
  name: string;

  @Expose()
  image: ResponseImageDto;

  @Expose()
  address: string;

  @Expose()
  @Type(() => PhoneStoreDto)
  phone: PhoneStoreDto[];

  @Expose()
  openingHours: string;

  @Expose()
  closingHours: string;

  @Expose()
  isActive: boolean;

  @Expose()
  lat: number;

  @Expose()
  lng: number;
}
