import { BaseMetadataDto } from '@/shared/dtos/res/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { ProductPromotionDto } from './product-promotion.dto';

export class ProductPromotionMetadataDto extends BaseMetadataDto implements IMetadata<ProductPromotionDto> {
  @Expose()
  @Type(() => ProductPromotionDto)
  data: ProductPromotionDto[];
}
