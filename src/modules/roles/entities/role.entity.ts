import { PermissionEntity } from '@/modules/permissions/entities/permission.entity';
import { StaffEntity } from '@/modules/staffs/entities/staff.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { IRole } from '@/shared/interfaces/models/role.interface';
import { Column, Entity, Index, JoinTable, ManyToMany } from 'typeorm';

@Entity('roles')
@Index('idx_active_roles', ['name'], { where: '"isActive" = \'true\'' })
export class RoleEntity extends BaseEntity implements IRole {
  @Column({ unique: true })
  name: string;

  @Column()
  desc: string;

  @Column({ unique: true, type: 'int', generated: 'increment' })
  code: number;

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
    this.logger.debug(`Đã chèn thành công Role có name: ${this.name}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công Role có name: ${this.name}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công Role có name: ${this.name}`);
  }
}
