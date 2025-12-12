import { Exclude } from 'class-transformer';
import { Product } from 'src/modules/prod/product/entities/product.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Token } from 'src/modules/token/entities/token.entity';
import { Base } from 'src/shared/entity/Base.entity';
import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
} from 'typeorm';

@Entity()
@Index(['username', 'email', 'phone'], { unique: true })
export class User extends Base {
  @Column()
  username: string;

  @Column()
  email: string;

  @Column({ length: 20, unique: true })
  phone: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: true })
  isActive: boolean;

  // 1 - N
  @OneToMany(() => Token, (token) => token.userId)
  tokenIds: Token[];

  // 1 - N
  @OneToMany(() => Product, (p) => p.userId)
  productIds: Product[];

  // N - N
  @ManyToMany(() => Role, (role) => role.userIds)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roleIds: Role[];
}
