import { Permission } from 'src/modules/permission/entities/permission.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Base } from 'src/shared/entity/Base.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

@Entity()
export class Role extends Base {
  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  code: string; // SUPER_ADMIN, STORE_MANAGER, etc.

  @Column({ nullable: true })
  description: string;

  @Column({ default: 0 })
  level: number; // Hierarchy level: 0 = highest (super admin)

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => User, (user) => user.roleIds)
  userIds: User[];

  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  @ManyToMany(() => Permission, (permission) => permission.roles, {
    eager: true, // Tự động load permissions khi load role
    cascade: true, // Tự động lưu thay đổi permissions khi lưu role
  })
  permissions: Permission[];
}
