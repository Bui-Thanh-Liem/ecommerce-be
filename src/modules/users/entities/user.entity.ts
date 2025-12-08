import { Product } from 'src/modules/products/entities/product.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Token } from 'src/modules/tokens/entities/token.entity';
import { Base } from 'src/shared/entity/Base.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity()
export class User extends Base {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  age: number;

  @OneToOne(() => Token, (t) => t.user)
  token: Token;

  @OneToMany(() => Product, (p) => p.user, {
    // One-to-Many high cascade
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  products: Product[];

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];
}
