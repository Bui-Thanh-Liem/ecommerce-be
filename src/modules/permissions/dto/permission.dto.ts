import { SerializerDto } from '@/shared/dtos/serializer.dto';
import { Expose } from 'class-transformer';

export class PermissionDto extends SerializerDto {
  @Expose()
  id: string;

  @Expose()
  keyGroup: string;

  @Expose()
  name: string;

  @Expose()
  desc: string;

  @Expose()
  code: string;

  @Expose()
  isActive: boolean;
}
