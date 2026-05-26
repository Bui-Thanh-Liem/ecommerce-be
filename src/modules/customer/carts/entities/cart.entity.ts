import { CustomerEntity } from '@/modules/customer/customers/entities/customer.entity';
import { VoucherEntity } from '@/modules/payments/vouchers/entities/voucher.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { CartStatus } from '@/shared/enums/cart-status.enum';
import { ICart } from '@/shared/interfaces/models/cart.interface';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { CartItemEntity } from '../../cart-items/entities/cart-item.entity';

@Entity('carts')
export class CartEntity extends BaseEntity implements ICart {
  @ManyToOne(() => CustomerEntity, (customer) => customer.carts, { onDelete: 'CASCADE', nullable: true })
  customer: CustomerEntity;

  @Column({ type: 'uuid', nullable: true })
  session: string;

  @Column({ type: 'int', default: 0 })
  totalItems: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalPrice: number;

  @ManyToMany(() => VoucherEntity, (voucher) => voucher.carts, { nullable: true })
  @JoinTable({ name: 'cart_vouchers' }) // Bảng trung gian
  vouchers?: VoucherEntity[];

  @Column({ type: 'enum', enum: CartStatus, default: CartStatus.ACTIVE })
  status: CartStatus;

  @OneToMany(() => CartItemEntity, (cartItem) => cartItem.cart, { cascade: true })
  cartItems?: CartItemEntity[];

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công CartItem có name: ${this.totalPrice}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công Cart có name: ${this.totalPrice}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công Cart có name: ${this.totalPrice}`);
  }
}
