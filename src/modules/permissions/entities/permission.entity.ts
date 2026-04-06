import { RoleEntity } from '@/modules/roles/entities/role.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { IPermission } from '@/shared/interfaces/models/permission.interface';
import { Column, Entity, Index, ManyToMany } from 'typeorm';

@Entity('permissions')
@Index('idx_active_permissions', ['name', 'code'], { where: '"isActive" = \'true\'' })
export class PermissionEntity extends BaseEntity implements IPermission {
  @Column()
  name: string;

  @Column()
  desc: string;

  @Column({ unique: true })
  code: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => RoleEntity, (role) => role.permissions)
  roles?: RoleEntity[] | undefined;

  logInsert(): void {
    console.log(`Đã chèn thành công Permission có name: ${this.name}`);
  }
  logUpdate(): void {
    console.log(`Đã cập nhật thành công Permission có name: ${this.name}`);
  }
  logRemove(): void {
    console.log(`Đã xóa thành công Permission có name: ${this.name}`);
  }
}
