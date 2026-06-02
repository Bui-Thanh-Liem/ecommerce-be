import { BaseEntity } from '@/shared/entities/base.entity';
import { AuditLogStatus } from '@/shared/enums/audit-log-status.enum';
import { IAuditLog } from '@/shared/interfaces/models/audit-log.interface';
import { Column, Entity, Index } from 'typeorm';

@Entity('audit_logs')
@Index('idx_audit_logs_email', ['email'])
@Index('idx_audit_logs_username', ['username'])
@Index('idx_audit_logs_statusCode', ['statusCode'])
export class AuditLogEntity extends BaseEntity implements IAuditLog {
  @Column()
  staffId: string;

  @Column({ nullable: true, type: 'varchar', length: 50 })
  username: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 45 })
  ipAddress: string;

  @Column({ type: 'varchar', length: 255 })
  userAgent: string;

  @Column({ type: 'varchar', length: 10 })
  method: string;

  @Column({ type: 'varchar', length: 255 })
  endpoint: string;

  @Column({ type: 'varchar', length: 255 })
  desc: string;

  @Column({ type: 'int' })
  statusCode: number;

  @Column({ type: 'jsonb', nullable: true })
  requestPayload: any;

  @Column({ type: 'jsonb', nullable: true })
  responsePayload: any;

  @Column({ type: 'enum', enum: AuditLogStatus, default: AuditLogStatus.PENDING })
  status: AuditLogStatus;

  @Column()
  keySession: string;

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công bản ghi có endpoint: ${this.endpoint}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công bản ghi có endpoint: ${this.endpoint}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công bản ghi có endpoint: ${this.endpoint}`);
  }
}
