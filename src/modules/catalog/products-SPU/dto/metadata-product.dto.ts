import { BaseMetadataDto } from '@/shared/dtos/res/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { ProductSPUDto } from './product-SPU.dto';

export class ProductMetadataDto extends BaseMetadataDto implements IMetadata<ProductSPUDto> {
  @Expose()
  @Type(() => ProductSPUDto)
  data: ProductSPUDto[];
}
