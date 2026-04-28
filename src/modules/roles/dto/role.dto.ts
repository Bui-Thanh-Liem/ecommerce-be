import { PermissionDto } from '@/modules/permissions/dto/permission.dto';
import { StoreDto } from '@/modules/stores/dto/store.dto';
import { SerializerDto } from '@/shared/dtos/serializer.dto';
import { Expose, Type } from 'class-transformer';

export class RoleDto extends SerializerDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => PermissionDto)
  permissions: PermissionDto[];

  @Expose()
  store: StoreDto;

  @Expose()
  isActive: boolean;

  @Expose()
  code: boolean;

  @Expose()
  description: string;
}
