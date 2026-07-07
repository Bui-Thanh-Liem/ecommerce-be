import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { Expose } from 'class-transformer';
import { CustomerDto } from '../../customers/dto/customer.dto';
import { LocationRegionDto } from '@/modules/inventory/location-regions/dto/location-region.dto';

export class CustomerAddressDto extends SerializerDto {
  @Expose()
  customer: CustomerDto;

  @Expose()
  country: LocationRegionDto;

  @Expose()
  provinceCity: LocationRegionDto;

  @Expose()
  districtTown: LocationRegionDto;

  @Expose()
  wardCommune: LocationRegionDto;

  @Expose()
  address: string;

  @Expose()
  recipientName: string;

  @Expose()
  recipientPhone: string;

  @Expose()
  isDefault: boolean;
}
