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
  name: string;

  @Column()
  age: number;

  @Column({ length: 20, unique: true })
  phone: string;

  // 1 - 1
  @OneToOne(() => Token, (t) => t.user, {
    cascade: true, //  cấp độ ứng dụng
    onDelete: 'CASCADE', // cấp độ cơ sở dữ liệu
    onUpdate: 'CASCADE', // cấp độ cơ sở dữ liệu
  })
  token: Token;

  // 1 - N
  @OneToMany(() => Product, (p) => p.user)
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
