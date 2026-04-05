import { PermissionEntity } from 'src/modules/permissions/entities/permission.entity';
import { StaffEntity } from 'src/modules/staffs/entities/staff.entity';
import { BaseEntity } from 'src/shared/entities/base.entity';
import { IRole } from 'src/shared/interfaces/models/role.interface';
import { Column, Entity, Index, JoinTable, ManyToMany } from 'typeorm';

@Entity('roles')
@Index('idx_active_roles', ['name'], { where: '"isActive" = \'true\'' })
export class RoleEntity extends BaseEntity implements IRole {
  @Column()
  name: string;

  @Column()
  desc: string;

  @ManyToMany(() => PermissionEntity, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permission',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: PermissionEntity[];

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => StaffEntity, (staff) => staff.roles)
  staffs?: StaffEntity[] | undefined;

  logInsert(): void {
    console.log(`Đã chèn thành công Role có name: ${this.name}`);
  }
  logUpdate(): void {
    console.log(`Đã cập nhật thành công Role có name: ${this.name}`);
  }
  logRemove(): void {
    console.log(`Đã xóa thành công Role có name: ${this.name}`);
  }
}
