import { CartEntity } from '@/modules/customer/carts/entities/cart.entity';
import { RatingEntity } from '@/modules/customer/rating/entities/rating.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { ICustomer } from '@/shared/interfaces/models/customer.interface';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('customers')
export class CustomerEntity extends BaseEntity implements ICustomer {
  @Column({ type: 'varchar', length: 50 })
  fullname: string;

  @Column({ unique: true, type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column('json')
  address: string[];

  // Quan hệ với các entity khác
  @OneToMany(() => RatingEntity, (rating) => rating.customer, { nullable: true })
  ratings: RatingEntity[];

  @OneToMany(() => CartEntity, (cart) => cart.customer, { nullable: true })
  carts: CartEntity[];

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
