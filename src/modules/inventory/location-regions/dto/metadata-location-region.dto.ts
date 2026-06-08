import { BaseMetadataDto } from '@/shared/dtos/res/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { LocationRegionDto } from './location-region.dto';

export class LocationRegionMetadataDto extends BaseMetadataDto implements IMetadata<LocationRegionDto> {
  @Expose()
  @Type(() => LocationRegionDto)
  data: LocationRegionDto[];
}
