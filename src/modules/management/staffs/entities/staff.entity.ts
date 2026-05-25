import { StoreEntity } from '@/modules/inventory/stores/entities/store.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { StaffWorkLocationID } from '@/shared/enums/staff-work-location-id.enum';
import { IStaff } from '@/shared/interfaces/models/staff.interface';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { RoleEntity } from '../../roles/entities/role.entity';
import { TeamEntity } from '../../teams/entities/team.entity';

@Entity('staffs')
export class StaffEntity extends BaseEntity implements IStaff {
  @Column({ nullable: true, type: 'text' })
  avatarUrl: string | undefined;

  @Column({ nullable: true, type: 'varchar', length: 50 })
  fullName: string;

  @Column({ unique: true, type: 'varchar', length: 20 })
  phone: string;

  @Column({ unique: true, type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'enum', enum: StaffWorkLocationID })
  workLocationID: StaffWorkLocationID;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @ManyToMany(() => RoleEntity, (role) => role.staffs, { nullable: true })
  @JoinTable({
    name: 'staff_role',
    joinColumn: { name: 'staff_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: RoleEntity[];

  @ManyToOne(() => StoreEntity, (store) => store.id, { nullable: true, onDelete: 'SET NULL' }) // superAdmin thì null
  store: StoreEntity | null; //  1 Staff thì thuộc 1 Store, còn Store có thể có nhiều Staff, superAdmin thì null

  @ManyToOne(() => StaffEntity, (staff) => staff.id, { nullable: true })
  directManager: StaffEntity;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSuperAdmin: boolean;

  @Column({ default: false })
  isSubAdmin: boolean;

  @Column({ default: false })
  isStoreAdmin: boolean;

  @OneToOne(() => StoreEntity, (store) => store.manager, { nullable: true })
  managedStore: StoreEntity;

  //
  @OneToMany(() => TeamEntity, (team) => team.leader)
  teamsLed: TeamEntity[];

  @OneToMany(() => TeamEntity, (team) => team.members)
  teamMemberships: TeamEntity[];

  logInsert() {
    this.logger.debug(`Đã chèn thành công Staff có Email: ${this.email}`);
  }

  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công Staff có Email: ${this.email}`);
  }

  logRemove(): void {
    this.logger.debug(`Đã xóa thành công Staff có Email: ${this.email}`);
  }
}
