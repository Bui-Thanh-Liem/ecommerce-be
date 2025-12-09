import { User } from 'src/modules/users/entities/user.entity';
import { Base } from 'src/shared/entity/Base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Product extends Base {
  @Column()
  name: string;

  @Column()
  description: string;

  @JoinColumn() // Tùy chọn: Chỉ định cột khóa ngoại
  @ManyToOne(() => User, (u) => u.products)
  user: User;
}
