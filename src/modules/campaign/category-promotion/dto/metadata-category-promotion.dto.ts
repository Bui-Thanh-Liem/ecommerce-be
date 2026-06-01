import { BaseMetadataDto } from '@/shared/dtos/res/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/metadata.interface';
import { CategoryPromotionDto } from './category-promotion.dto';

export class CategoryPromotionMetadataDto extends BaseMetadataDto implements IMetadata<CategoryPromotionDto> {
  @Expose()
  @Type(() => CategoryPromotionDto)
  data: CategoryPromotionDto[];
}
