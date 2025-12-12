import { Permission } from 'src/modules/permission/entities/permission.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Base } from 'src/shared/entity/Base.entity';
import { Column, Entity, Index, JoinTable, ManyToMany } from 'typeorm';

@Entity()
@Index(['name'], { unique: true })
export class Role extends Base {
  @Column()
  name: string; // admin, user, manager, etc.

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
