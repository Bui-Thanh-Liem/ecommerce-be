import { BaseEntity } from '@/shared/entities/base.entity';
import { IOrderItem } from '@/shared/interfaces/models/customer/order-item.interface';
import { Column, Entity, ManyToOne } from 'typeorm';
import { OrderEntity } from '../../orders/entities/order.entity';
import { ProductVariantEntity } from '@/modules/catalog/product-variants-SKU/entities/product-variant.entity';

@Entity('order_items')
export class OrderItemEntity extends BaseEntity implements IOrderItem {
  @ManyToOne(() => OrderEntity, (order) => order.orderItems, { onDelete: 'CASCADE', nullable: false })
  order: OrderEntity;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @ManyToOne(() => ProductVariantEntity, { nullable: false })
  product: ProductVariantEntity;

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công OrderItem có price: ${this.price}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công OrderItem có price: ${this.price}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công OrderItem có price: ${this.price}`);
  }
}
