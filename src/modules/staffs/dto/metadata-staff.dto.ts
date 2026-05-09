import { BaseMetadataDto } from '@/shared/dtos/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { StaffDto } from './staff.dto';
import { IMetadata } from '@/shared/interfaces/metadata.interface';

export class StaffMetadataDto extends BaseMetadataDto implements IMetadata<StaffDto> {
  @Expose()
  @Type(() => StaffDto)
  data: StaffDto[];
}
