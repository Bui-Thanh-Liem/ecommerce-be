import { BaseMetadataDto } from '@/shared/dtos/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/metadata.interface';
import { RoleDto } from './role.dto';

export class RoleMetadataDto extends BaseMetadataDto implements IMetadata<RoleDto> {
  @Expose()
  @Type(() => RoleDto)
  data: RoleDto[];
}
