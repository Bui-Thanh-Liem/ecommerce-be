import { BaseEntity } from '@/shared/entities/base.entity';
import { TokenType } from '@/shared/enums/token-type.enum';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { CustomerEntity } from '../../customers/entities/customer.entity';
import { ICustomerToken } from '@/shared/interfaces/models/management/customer-token.interface';

@Entity('customer_tokens')
export class CustomerTokenEntity extends BaseEntity implements ICustomerToken {
  @OneToOne(() => CustomerEntity, (customer) => customer.id)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @Column({ type: 'enum', enum: TokenType })
  type: TokenType;

  @Column({ type: 'text' })
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: false })
  isRevoked: boolean;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  ipAddress: string;

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công CustomerToken có ipAddress: ${this.ipAddress}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công CustomerToken có ipAddress: ${this.ipAddress}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công CustomerToken có ipAddress: ${this.ipAddress}`);
  }
}
