import { BaseMetadataDto } from '@/shared/dtos/res/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { CustomerDto } from './customer.dto';

export class CustomerMetadataDto extends BaseMetadataDto implements IMetadata<CustomerDto> {
  @Expose()
  @Type(() => CustomerDto)
  data: CustomerDto[];
}
