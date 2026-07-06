import { BaseMetadataDto } from '@/shared/dtos/res/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { CustomerAddressDto } from './customer-address.dto';

export class CustomerAddressMetadataDto extends BaseMetadataDto implements IMetadata<CustomerAddressDto> {
  @Expose()
  @Type(() => CustomerAddressDto)
  data: CustomerAddressDto[];
}
