import { BaseMetadataDto } from '@/shared/dtos/res/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { DocumentDto } from './document.dto';

export class DocumentMetadataDto extends BaseMetadataDto implements IMetadata<DocumentDto> {
  @Expose()
  @Type(() => DocumentDto)
  data: DocumentDto[];
}
