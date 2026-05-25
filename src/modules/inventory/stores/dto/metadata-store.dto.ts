import { BaseMetadataDto } from '@/shared/dtos/res/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/metadata.interface';
import { StoreDto } from './store.dto';

export class StoreMetadataDto extends BaseMetadataDto implements IMetadata<StoreDto> {
  @Expose()
  @Type(() => StoreDto)
  data: StoreDto[];
}
