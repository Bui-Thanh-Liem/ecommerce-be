import { StaffEntity } from '@/modules/staffs/entities/staff.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { StaffTokenType } from '@/shared/enums/staff-token-type.enum';
import { IStaffToken } from '@/shared/interfaces/models/staff-token.interface';
import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';

@Entity('staff_tokens')
@Index('idx_active_staff_tokens', ['staffId'], { where: '"isRevoked" = \'false\'' })
export class StaffTokenEntity extends BaseEntity implements IStaffToken {
  @OneToOne(() => StaffEntity, (staff) => staff.id)
  @JoinColumn({ name: 'staff_id' })
  staffId: StaffEntity;

  @Column({ type: 'enum', enum: StaffTokenType })
  type: StaffTokenType;

  @Column()
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
    console.log(`Đã chèn thành công StaffToken có ipAddress: ${this.ipAddress}`);
  }
  logUpdate(): void {
    console.log(`Đã cập nhật thành công StaffToken có ipAddress: ${this.ipAddress}`);
  }
  logRemove(): void {
    console.log(`Đã xóa thành công StaffToken có ipAddress: ${this.ipAddress}`);
  }
}
