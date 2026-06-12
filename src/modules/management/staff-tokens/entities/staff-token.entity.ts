import { BaseEntity } from '@/shared/entities/base.entity';
import { TokenType } from '@/shared/enums/token-type.enum';
import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { StaffEntity } from '../../staffs/entities/staff.entity';
import { IStaffToken } from '@/shared/interfaces/models/management/staff-token.interface';

@Entity('staff_tokens')
@Index('idx_active_staff_tokens', ['staff'], { where: '"isRevoked" = \'false\'' })
export class StaffTokenEntity extends BaseEntity implements IStaffToken {
  @OneToOne(() => StaffEntity, (staff) => staff.id)
  @JoinColumn({ name: 'staff_id' })
  staff: StaffEntity;

  @Column({ type: 'enum', enum: TokenType })
  type: TokenType;

  @Column({ type: 'text' })
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: false })
  isRevoked: boolean;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  ipAddress: string;

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công StaffToken có ipAddress: ${this.ipAddress}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công StaffToken có ipAddress: ${this.ipAddress}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công StaffToken có ipAddress: ${this.ipAddress}`);
  }
}
