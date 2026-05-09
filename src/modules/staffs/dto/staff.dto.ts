import { RoleDto } from '@/modules/roles/dto/role.dto';
import { StoreDto } from '@/modules/stores/dto/store.dto';
import { SerializerDto } from '@/shared/dtos/serializer.dto';
import { StaffWorkLocationID } from '@/shared/enums/staff-work-location-id.enum';
import { Exclude, Expose, Type } from 'class-transformer';

export class StaffDto extends SerializerDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  avatarUrl: string;

  @Expose()
  phone: string;

  @Expose()
  fullName: string;

  @Expose()
  workLocationID: StaffWorkLocationID;

  @Expose()
  @Type(() => StoreDto)
  store: StoreDto;

  @Expose()
  @Type(() => RoleDto)
  roles: RoleDto[];

  @Expose()
  @Type(() => StaffDto)
  directManager: StaffDto;

  @Expose()
  isActive: boolean;

  @Expose()
  isAdmin: boolean;

  @Expose()
  isSuperAdmin: boolean;

  @Expose()
  isSubAdmin: boolean;

  @Expose()
  isStoreAdmin: boolean;

  @Exclude()
  password: string;
}
