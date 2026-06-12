import { BaseMetadataDto } from '@/shared/dtos/res/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { MktProgramDto } from './mkt-program.dto';

export class MktProgramMetadataDto extends BaseMetadataDto implements IMetadata<MktProgramDto> {
  @Expose()
  @Type(() => MktProgramDto)
  data: MktProgramDto[];
}
