import { BaseMetadataDto } from '@/shared/dtos/res/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { PopularSearchDto } from './popular-search.dto';

export class PopularSearchMetadataDto extends BaseMetadataDto implements IMetadata<PopularSearchDto> {
  @Expose()
  @Type(() => PopularSearchDto)
  data: PopularSearchDto[];
}
