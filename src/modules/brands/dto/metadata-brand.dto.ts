import { BaseMetadataDto } from '@/shared/dtos/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/metadata.interface';
import { BrandDto } from './brand.dto';

export class BrandMetadataDto extends BaseMetadataDto implements IMetadata<BrandDto> {
  @Expose()
  @Type(() => BrandDto)
  data: BrandDto[];
}
