import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { AuditLogStatus } from '@/shared/enums/audit-log-status.enum';
import { Expose } from 'class-transformer';

export class AuditLogDto extends SerializerDto {
  @Expose()
  staffId: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  roles: string[];

  @Expose()
  ipAddress: string;

  @Expose()
  userAgent: string;

  @Expose()
  method: string;

  @Expose()
  endpoint: string;

  @Expose()
  desc: string;

  @Expose()
  statusCode: number;

  @Expose()
  requestPayload: any;

  @Expose()
  responsePayload: any;

  @Expose()
  status: AuditLogStatus;
}
