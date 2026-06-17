import { TokenType } from '@/shared/enums/token-type.enum';
import { IBase } from '../../common/base.interface';
import { IStaff } from './staff.interface';

export interface IStaffToken extends IBase {
  staff: IStaff;
  type: TokenType;
  token: string; // refresh
  // eslint-disable-next-line max-len
  usedToken: string; // refresh đã được sử dụng để đổi lấy access token mới, dùng để kiểm tra nếu có token nào bị lạm dụng (sử dụng nhiều lần)
  expiresAt: Date; // thời gian hết hạn của token
  isRevoked: boolean;
  // eslint-disable-next-line max-len
  userAgent: string; // thông tin về trình duyệt hoặc thiết bị mà token được tạo ra, giúp theo dõi và quản lý các phiên đăng nhập của nhân viên.
  ipAddress: string; // địa chỉ IP từ đó token được tạo ra, giúp theo dõi và quản lý các phiên đăng nhập của nhân viên.
}
