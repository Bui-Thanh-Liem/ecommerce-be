import { BaseMetadataDto } from '@/shared/dtos/res/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { OrderDto } from './order.dto';

export class OrderMetadataDto extends BaseMetadataDto implements IMetadata<OrderDto> {
  @Expose()
  @Type(() => OrderDto)
  data: OrderDto[];
}
