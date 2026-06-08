import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { Expose, Type } from 'class-transformer';
import { LocationRegionDto } from './location-region.dto';

export class LocationRegionSelectionDto extends SerializerDto {
  @Expose()
  addressDetail: string;

  @Expose()
  @Type(() => LocationRegionDto)
  wardCommune?: LocationRegionDto;

  @Expose()
  @Type(() => LocationRegionDto)
  districtTown?: LocationRegionDto;
}
