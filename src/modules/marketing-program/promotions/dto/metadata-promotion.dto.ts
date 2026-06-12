import { BaseMetadataDto } from '@/shared/dtos/res/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { PromotionDto } from './promotion.dto';

export class PromotionMetadataDto extends BaseMetadataDto implements IMetadata<PromotionDto> {
  @Expose()
  @Type(() => PromotionDto)
  data: PromotionDto[];
}
