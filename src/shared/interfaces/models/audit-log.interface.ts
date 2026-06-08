import { AuditLogStatus } from '@/shared/enums/audit-log-status.enum';
import { IBase } from '../common/base.interface';

export interface IAuditLog extends IBase {
  // Thông tin người thực hiện hành động
  staffId: string;
  username: string;
  email: string;
  phone: string;
  ipAddress: string;
  userAgent: string;
  roles?: string[];
  isSuperAdmin: boolean;
  isSubAdmin: boolean;

  // Thông tin chi tiết về hành động
  method: string; // GET, POST, PUT, DELETE, ...
  endpoint: string; // URL endpoint được truy cập
  desc: string; // Mô tả ngắn gọn về hành động
  statusCode: number; // HTTP status code của phản hồi
  requestPayload: any; // Dữ liệu gửi lên server (nếu có)
  responsePayload: any; // Dữ liệu trả về từ server (nếu có)
  status: AuditLogStatus;

  // Key làm việc trong 1 vòng đời request PENDING -> SUCCESS/FAILURE
  keySession: string;
}
