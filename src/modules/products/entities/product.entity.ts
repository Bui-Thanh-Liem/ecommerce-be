import { User } from 'src/modules/users/entities/user.entity';
import { Base } from 'src/shared/entity/Base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Product extends Base {
  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => User)
  user: User;
}
