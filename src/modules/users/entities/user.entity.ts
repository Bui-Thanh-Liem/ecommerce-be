import { Product } from 'src/modules/products/entities/product.entity';
import { Token } from 'src/modules/tokens/entities/token.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  age: number;

  @OneToOne(() => Token, (t) => t.user)
  token: Token;


  @OneToMany(() => Product, (p) => p.owner, { // One-to-Many high cascade
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  products: Product[];
}
