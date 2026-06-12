import { BaseMetadataDto } from '@/shared/dtos/res/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { CustomerProductDto } from './customer-product.dto';

export class CustomerProductMetadataDto extends BaseMetadataDto implements IMetadata<CustomerProductDto> {
  @Expose()
  @Type(() => CustomerProductDto)
  data: CustomerProductDto[];
}
