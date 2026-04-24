import { StaffDto } from '@/modules/staffs/dto/staff.dto';
import { StaffTokenType } from '@/shared/enums/staff-token-type.enum';
import { Expose } from 'class-transformer';

export class StaffTokenDto {
  @Expose()
  token: string;

  @Expose()
  type: StaffTokenType;

  @Expose()
  staff: StaffDto;

  @Expose()
  expiresAt: Date;

  @Expose()
  isRevoked: boolean;

  @Expose()
  userAgent: string;

  @Expose()
  ipAddress: string;
}
