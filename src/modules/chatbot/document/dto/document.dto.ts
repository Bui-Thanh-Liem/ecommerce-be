import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { Expose } from 'class-transformer';
import { type DocumentStatus } from '../document.type';

export class DocumentDto extends SerializerDto {
  @Expose()
  filename: string;

  @Expose()
  status: DocumentStatus;

  @Expose()
  chunkCount: number;
}
