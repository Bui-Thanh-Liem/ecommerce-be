import { StoreDto } from '@/modules/inventory/stores/dto/store.dto';
import { TeamCategoryDto } from '@/modules/management/team-categories/dto/team-category.dto';
import { Expose, Type } from 'class-transformer';
import { StaffDto } from '../../staffs/dto/staff.dto';
import { SerializerDto } from '@/shared/dtos/res/serializer.dto';

export class TeamDto extends SerializerDto {
  @Expose()
  name: string;

  @Expose()
  desc: string;

  @Expose()
  category: TeamCategoryDto;

  @Expose()
  leader: StaffDto;

  @Expose()
  @Type(() => StaffDto)
  members: StaffDto[];

  @Expose()
  store: StoreDto;

  @Expose()
  isActive: boolean;
}
