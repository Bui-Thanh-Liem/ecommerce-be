import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { Expose } from 'class-transformer';
import { type DocumentStatus } from '../document.type';

export class DocumentDto extends SerializerDto {
  @Expose()
  filename: string;

  @Expose()
  originalname: string;

  @Expose()
  filePath: string;

  @Expose()
  status: DocumentStatus;

  @Expose()
  chunkCount: number;

  @Expose()
  fileSize: number;
}
