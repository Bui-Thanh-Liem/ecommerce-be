import { BaseMetadataDto } from '@/shared/dtos/res/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { AuditLogDto } from './audit-log.dto';

export class AuditLogMetadataDto extends BaseMetadataDto implements IMetadata<AuditLogDto> {
  @Expose()
  @Type(() => AuditLogDto)
  data: AuditLogDto[];
}
