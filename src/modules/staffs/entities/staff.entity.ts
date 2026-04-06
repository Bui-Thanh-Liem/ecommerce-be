import { RoleEntity } from '@/modules/roles/entities/role.entity';
import { StoreEntity } from '@/modules/stores/entities/store.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { IStaff } from '@/shared/interfaces/models/staff.interface';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

@Entity('staffs')
export class StaffEntity extends BaseEntity implements IStaff {
  @Column({ nullable: true })
  fullName: string;

  @Column({ unique: true })
  phone: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @ManyToMany(() => RoleEntity, (role) => role.staffs, { nullable: true })
  @JoinTable({
    name: 'staff_role',
    joinColumn: { name: 'staff_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: RoleEntity[];

  @ManyToOne(() => StoreEntity, (store) => store.id, { nullable: true }) // superAdmin thì null
  store: StoreEntity | null; //  1 Staff thì thuộc 1 Store, còn Store có thể có nhiều Staff, superAdmin thì null

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isAdmin: boolean;

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
