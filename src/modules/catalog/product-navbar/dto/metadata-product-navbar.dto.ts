import { BaseMetadataDto } from '@/shared/dtos/res/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/metadata.interface';
import { ProductNavbarDto } from './product-navbar.dto';

export class ProductNavbarMetadataDto extends BaseMetadataDto implements IMetadata<ProductNavbarDto> {
  @Expose()
  @Type(() => ProductNavbarDto)
  data: ProductNavbarDto[];
}
