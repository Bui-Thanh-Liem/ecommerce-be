import { BaseEntity } from '@/shared/entities/base.entity';
import { PaymentGateway } from '@/shared/enums/order-payment-gateway.enum';
import { OrderStatus } from '@/shared/enums/order-status.enum';
import { IOrder } from '@/shared/interfaces/models/customer/order.interface';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { CustomerEntity } from '../../customers/entities/customer.entity';
import { OrderItemEntity } from '../../order-items/entities/order-item.entity';
import { PaymentMethod } from '@/shared/enums/payment-method.enum';
import { ProductVariantEntity } from '@/modules/catalog/product-variants-SKU/entities/product-variant.entity';

@Entity('orders')
export class OrderEntity extends BaseEntity implements IOrder {
  @ManyToOne(() => CustomerEntity, (cus) => cus.orders, { onDelete: 'CASCADE', nullable: false })
  customer: CustomerEntity;

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.order, { cascade: true, orphanedRowAction: 'delete' })
  orderItems: OrderItemEntity[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'enum', enum: PaymentGateway, nullable: false })
  paymentGateway: PaymentGateway;

  @Column({ type: 'enum', enum: PaymentMethod, nullable: false })
  paymentMethod: PaymentMethod;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ nullable: true })
  invoiceNumber?: string;

  @Column({ type: 'text' })
  shoppingAddress: string;

  @Column()
  recipientName: string;

  @Column()
  recipientPhone: string;

  // Ở Service chỉ cần order.orderItems=[{product: uuid, price: number, quantity: number}] là đủ
  @BeforeInsert()
  @BeforeUpdate()
  createOrderItemsRelations() {
    if (this.orderItems) {
      this.orderItems.forEach((item) => {
        item.order = this;
        const productId = typeof item.product === 'string' ? item.product : item.product?.id;
        item.product = { id: productId } as ProductVariantEntity;
      });
    }
  }

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công Order có totalAmount: ${this.totalAmount}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công Order có totalAmount: ${this.totalAmount}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công Order có totalAmount: ${this.totalAmount}`);
  }
}
