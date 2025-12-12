import { User } from 'src/modules/user/entities/user.entity';
import { Base } from 'src/shared/entity/Base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
@Index(['token'], { unique: true })
export class Token extends Base {
  @Column({ type: 'varchar', length: 500 })
  token: string; // refresh token

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  isRevoked: boolean;

  @Column({ type: 'simple-array', nullable: true })
  tokenUsage: string[]; // refresh tokens usage info

  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  userId: User;
}
