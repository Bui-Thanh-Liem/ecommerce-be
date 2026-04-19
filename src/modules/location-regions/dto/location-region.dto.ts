import { SerializerDto } from '@/shared/dtos/serializer.dto';
import { LocationRegionType } from '@/shared/enums/location-region-type.enum';
import { Expose, Type } from 'class-transformer';

export class LocationRegionDto extends SerializerDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  type: LocationRegionType;

  @Expose()
  parent: string | null;

  @Expose()
  @Type(() => LocationRegionDto)
  children?: LocationRegionDto[] | null;
}
