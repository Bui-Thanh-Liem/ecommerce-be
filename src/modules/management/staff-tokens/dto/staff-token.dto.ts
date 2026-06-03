import { TokenType } from '@/shared/enums/token-type.enum';
import { Expose } from 'class-transformer';
import { StaffDto } from '../../staffs/dto/staff.dto';

export class StaffTokenDto {
  @Expose()
  token: string;

  @Expose()
  type: TokenType;

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
