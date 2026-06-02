import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { LocationRegionType } from '@/shared/enums/location-region-type.enum';
import { Expose, Type } from 'class-transformer';

export class LocationRegionDto extends SerializerDto {
  @Expose()
  name: string;

  @Expose()
  type: LocationRegionType;

  @Expose()
  parent: LocationRegionDto;

  @Expose()
  @Type(() => LocationRegionDto)
  children?: LocationRegionDto[] | null;
}
