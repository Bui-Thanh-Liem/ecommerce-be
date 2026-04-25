import { CartEntity } from '@/modules/carts/entities/cart.entity';
import { ProductVariantEntity } from '@/modules/product-variants-SKU/entities/product-variant.entity';
import { ProductEntity } from '@/modules/products-SPU/entities/product.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { ICartItem } from '@/shared/interfaces/models/cart-item.interface';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('cart_items')
export class CartItemEntity extends BaseEntity implements ICartItem {
  @ManyToOne(() => CartEntity, (cart) => cart.cartItems, { onDelete: 'CASCADE' })
  cart: CartEntity;

  @ManyToOne(() => ProductEntity, (product) => product.cartItems, { onDelete: 'CASCADE' })
  product: ProductEntity;

  @ManyToOne(() => ProductVariantEntity, (pv) => pv.cartItems, { onDelete: 'CASCADE' })
  productVariant: ProductVariantEntity;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  finalPrice: number;

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công CartItem có name: ${this.finalPrice}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công CartItem có name: ${this.finalPrice}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công CartItem có name: ${this.finalPrice}`);
  }
}
