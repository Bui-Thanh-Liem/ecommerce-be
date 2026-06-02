import { StoreDto } from '@/modules/inventory/stores/dto/store.dto';
import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { StaffWorkLocationID } from '@/shared/enums/staff-work-location-id.enum';
import { Exclude, Expose, Type } from 'class-transformer';
import { RoleDto } from '../../roles/dto/role.dto';
import { ResponseImageDto } from '@/shared/dtos/res/response-image.dto';

export class StaffDto extends SerializerDto {
  @Expose()
  email: string;

  @Expose()
  avatar: ResponseImageDto;

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
