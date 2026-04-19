import { LocationRegionDto } from '@/modules/location-regions/dto/location-region.dto';
import { SerializerDto } from '@/shared/dtos/serializer.dto';
import { Expose, Type } from 'class-transformer';

class PhoneStoreDto {
  @Expose()
  name: string;

  @Expose()
  phone: string;
}

export class StoreDto extends SerializerDto {
  @Expose()
  provinceCity: LocationRegionDto;

  @Expose()
  districtTown: LocationRegionDto;

  @Expose()
  wardCommune: LocationRegionDto;

  @Expose()
  id: string;

  @Expose()
  name: string;

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
