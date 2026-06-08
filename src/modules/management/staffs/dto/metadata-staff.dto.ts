import { BaseMetadataDto } from '@/shared/dtos/res/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { StaffDto } from './staff.dto';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';

export class StaffMetadataDto extends BaseMetadataDto implements IMetadata<StaffDto> {
  @Expose()
  @Type(() => StaffDto)
  data: StaffDto[];
}
