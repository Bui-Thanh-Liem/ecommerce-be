import { StaffTokenType } from '@/shared/enums/staff-token-type.enum';
import { IBase } from '../base.interface';
import { IStaff } from './staff.interface';

export interface IStaffToken extends IBase {
  staff: IStaff;
  type: StaffTokenType;
  token: string;
  expiresAt: Date; // thời gian hết hạn của token
  isRevoked: boolean;
  // eslint-disable-next-line max-len
  userAgent: string; // thông tin về trình duyệt hoặc thiết bị mà token được tạo ra, giúp theo dõi và quản lý các phiên đăng nhập của nhân viên.
  ipAddress: string; // địa chỉ IP từ đó token được tạo ra, giúp theo dõi và quản lý các phiên đăng nhập của nhân viên.
}
