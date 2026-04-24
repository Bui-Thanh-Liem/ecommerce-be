import { RatingEntity } from '@/modules/rating/entities/rating.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { ICustomer } from '@/shared/interfaces/models/customer.interface';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('customers')
export class CustomerEntity extends BaseEntity implements ICustomer {
  @Column()
  fullname: string;

  @Column({ unique: true, type: 'varchar', length: 15 })
  phone: string;

  @Column('jsonb')
  address: string[];

  // Quan hệ với các entity khác
  @OneToMany(() => RatingEntity, (rating) => rating.customer, { nullable: true })
  ratings: RatingEntity[];

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công Customer có fullname: ${this.fullname}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công Customer có fullname: ${this.fullname}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công Customer có fullname: ${this.fullname}`);
  }
}
