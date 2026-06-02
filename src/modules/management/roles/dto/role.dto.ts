import { PermissionDto } from '@/modules/management/permissions/dto/permission.dto';
import { StoreDto } from '@/modules/inventory/stores/dto/store.dto';
import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { Expose, Type } from 'class-transformer';

export class RoleDto extends SerializerDto {
  @Expose()
  name: string;

  @Expose()
  desc: string;

  @Expose()
  @Type(() => PermissionDto)
  permissions: PermissionDto[];

  @Expose()
  @Type(() => StoreDto)
  stores: StoreDto[];

  @Expose()
  isActive: boolean;

  @Expose()
  code: boolean;

  @Expose()
  description: string;
}
