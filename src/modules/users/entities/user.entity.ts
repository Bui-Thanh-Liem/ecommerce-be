import { Product } from 'src/modules/prod/products/entities/product.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Token } from 'src/modules/tokens/entities/token.entity';
import { Base } from 'src/shared/entity/Base.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';

@Entity()
export class User extends Base {
  @Column()
  name: string;

  @Column()
  age: number;

  @Column({ length: 20, unique: true })
  phone: string;

  // 1 - N
  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  // 1 - N
  @OneToMany(() => Product, (p) => p.userId)
  products: Product[];

  // N - N
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];
}
