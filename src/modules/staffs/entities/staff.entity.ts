import { RoleEntity } from 'src/modules/roles/entities/role.entity';
import { StoreEntity } from 'src/modules/stores/entities/store.entity';
import { BaseEntity } from 'src/shared/entities/base.entity';
import { IStaff } from 'src/shared/interfaces/models/staff.interface';
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
    console.log(`Đã chèn thành công Staff có Email: ${this.email}`);
  }

  logUpdate(): void {
    console.log(`Đã cập nhật thành công Staff có Email: ${this.email}`);
  }

  logRemove(): void {
    console.log(`Đã xóa thành công Staff có Email: ${this.email}`);
  }
}
