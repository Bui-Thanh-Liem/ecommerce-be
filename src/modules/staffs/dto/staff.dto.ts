import { RoleDto } from '@/modules/roles/dto/role.dto';
import { StoreDto } from '@/modules/stores/dto/store.dto';
import { SerializerDto } from '@/shared/dtos/serializer.dto';
import { Exclude, Expose, Type } from 'class-transformer';

export class StaffDto extends SerializerDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  fullName: string;

  @Expose()
  @Type(() => StoreDto)
  store: StoreDto;

  @Expose()
  @Type(() => RoleDto)
  roles: RoleDto[];

  @Expose()
  isActive: boolean;

  @Expose()
  isAdmin: boolean;

  @Expose()
  admin: boolean;

  @Exclude()
  password: string;
}
