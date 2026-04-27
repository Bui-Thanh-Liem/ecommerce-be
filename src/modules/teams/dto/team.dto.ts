import { StaffDto } from '@/modules/staffs/dto/staff.dto';
import { StoreDto } from '@/modules/stores/dto/store.dto';
import { TeamStatus } from '@/shared/enums/team-status.enum';
import { Expose, Type } from 'class-transformer';

export class TeamDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  desc: string;

  @Expose()
  leader: StaffDto;

  @Expose()
  @Type(() => StaffDto)
  members: StaffDto[];

  @Expose()
  store: StoreDto;

  @Expose()
  status: TeamStatus;
}
