import { Role } from 'src/modules/roles/entities/role.entity';
import { Base } from 'src/shared/entity/Base.entity';
import { Column, Entity, Index, ManyToMany } from 'typeorm';

@Entity()
@Index(['name', 'code'], { unique: true })
export class Permission extends Base {
  @Column()
  code: string; // 001, 002

  @Column()
  name: string; // product:create, product:read, product:update, product:delete

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
