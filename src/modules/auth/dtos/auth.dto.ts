import { StaffDto } from '@/modules/management/staffs/dto/staff.dto';
import { Expose, Type } from 'class-transformer';

export class AuthDto {
  @Expose()
  @Type(() => StaffDto)
  staff: StaffDto;

  @Expose()
  token: string;
}
