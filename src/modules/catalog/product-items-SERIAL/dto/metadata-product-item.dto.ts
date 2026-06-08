import { BaseMetadataDto } from '@/shared/dtos/res/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { ProductItemSerialDto } from './product-item-SERIAL.dto';

export class ProductItemMetadataDto extends BaseMetadataDto implements IMetadata<ProductItemSerialDto> {
  @Expose()
  @Type(() => ProductItemSerialDto)
  data: ProductItemSerialDto[];
}
