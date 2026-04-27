import { StaffEntity } from '@/modules/staffs/entities/staff.entity';
import { StoreEntity } from '@/modules/stores/entities/store.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { TeamStatus } from '@/shared/enums/team-status.enum';
import { ITeam } from '@/shared/interfaces/models/team.interface';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

@Entity('teams')
export class TeamEntity extends BaseEntity implements ITeam {
  @Column({ unique: true, type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  desc: string;

  @ManyToOne(() => StaffEntity, (staff) => staff.teamsLed, { nullable: false })
  leader: StaffEntity;

  @ManyToMany(() => StaffEntity, (staff) => staff.teamMemberships, { nullable: false })
  @JoinTable({
    name: 'team_members', // Tên bảng trung gian
    joinColumn: {
      name: 'team_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'staff_id',
      referencedColumnName: 'id',
    },
  })
  members: StaffEntity[];

  @ManyToOne(() => StoreEntity, (store) => store.id, { nullable: false })
  store: StoreEntity;

  @Column({ type: 'enum', enum: TeamStatus, default: TeamStatus.ACTIVE })
  status: TeamStatus;

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công Team có tên: ${this.name}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công Team có tên: ${this.name}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công Team có tên: ${this.name}`);
  }
}
