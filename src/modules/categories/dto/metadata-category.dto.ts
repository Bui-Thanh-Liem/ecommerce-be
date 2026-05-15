import { BaseMetadataDto } from '@/shared/dtos/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/metadata.interface';
import { CategoryDto } from './category.dto';

export class CategoryMetadataDto extends BaseMetadataDto implements IMetadata<CategoryDto> {
  @Expose()
  @Type(() => CategoryDto)
  data: CategoryDto[];
}
