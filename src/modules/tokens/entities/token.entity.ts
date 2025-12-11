import { User } from 'src/modules/users/entities/user.entity';
import { Base } from 'src/shared/entity/Base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Token extends Base {
  @Column({ type: 'varchar', length: 500 })
  token: string; // refresh token (JWT dài)

  @Column({ type: 'uuid' }) // hoặc number nếu user.id là number
  userId: string;

  @JoinColumn()
  @ManyToOne(() => User, {
    onDelete: 'CASCADE', // xóa user → xóa hết token luôn (rất quan trọng cho bảo mật)
    onUpdate: 'CASCADE',
  })
  user: User;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  isRevoked: boolean;
}
