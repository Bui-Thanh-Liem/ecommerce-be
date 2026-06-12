import { ProductVariantEntity } from '@/modules/catalog/product-variants-SKU/entities/product-variant.entity';
import { ProductEntity } from '@/modules/catalog/products-SPU/entities/product.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { type IImage } from '@/shared/interfaces/common/image.interface';
import { IProductImage } from '@/shared/interfaces/models/catalog/product-image.interface';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('product_images')
export class ProductImageEntity extends BaseEntity implements IProductImage {
  @Column({ type: 'json' })
  image: IImage;

  @Column({ type: 'int' })
  sortOrder: number;

  @Column({ default: false })
  isThumbnail: boolean;

  @ManyToOne(() => ProductEntity, (product) => product.productImages, { onDelete: 'CASCADE', nullable: true })
  product: ProductEntity;

  @ManyToOne(() => ProductVariantEntity, (variant) => variant.productImages, { onDelete: 'CASCADE', nullable: true })
  productVariant: ProductVariantEntity;

  logInsert(): void {
    const productName = this.product?.name || this.productVariant?.sku || 'Unknown Product';
    this.logger.debug(`Đã chèn thành công Product Image có product: ${productName}`);
  }
  logUpdate(): void {
    const productName = this.product?.name || this.productVariant?.sku || 'Unknown Product';
    this.logger.debug(`Đã cập nhật thành công Product Image có product: ${productName}`);
  }
  logRemove(): void {
    const productName = this.product?.name || this.productVariant?.sku || 'Unknown Product';
    this.logger.debug(`Đã xóa thành công Product Image có product: ${productName}`);
  }
}
