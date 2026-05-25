import { BaseMetadataDto } from '@/shared/dtos/res/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/metadata.interface';
import { InventoryDto } from './inventory.dto';

export class InventoryMetadataDto extends BaseMetadataDto implements IMetadata<InventoryDto> {
  @Expose()
  @Type(() => InventoryDto)
  data: InventoryDto[];
}
