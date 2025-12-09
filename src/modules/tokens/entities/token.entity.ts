import { User } from 'src/modules/users/entities/user.entity';
import { Base } from 'src/shared/entity/Base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class Token extends Base {
  @Column()
  token: string;

  @JoinColumn({ name: 'user_id' })
  @OneToOne(() => User)
  user: User;
}
