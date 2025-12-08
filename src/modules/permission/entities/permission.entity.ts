import { Role } from 'src/modules/roles/entities/role.entity';
import { Base } from 'src/shared/entity/Base.entity';
import { Column, Entity, ManyToMany } from 'typeorm';

@Entity()
export class Permission extends Base {
  @Column({ unique: true })
  code: string; // products:create, orders:read, etc.

  @Column()
  resource: string; // products, orders, customers, inventory

  @Column()
  action: string; // create, read, update, delete, manage

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
