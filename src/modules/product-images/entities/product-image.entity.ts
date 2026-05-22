import { ProductVariantEntity } from '@/modules/product-variants-SKU/entities/product-variant.entity';
import { ProductEntity } from '@/modules/products-SPU/entities/product.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { type IImage } from '@/shared/interfaces/image.interface';
import { IProductImage } from '@/shared/interfaces/models/product-image.interface';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('product_images')
export class ProductImageEntity extends BaseEntity implements IProductImage {
  @Column({ type: 'json' })
  image: IImage;

  @Column({ type: 'int' })
  sortOrder: number;

  @Column({ default: false })
  isThumbnail: boolean;

  @ManyToOne(() => ProductEntity, (product) => product.productImages, { onDelete: 'CASCADE' })
  product: ProductEntity;

  @ManyToOne(() => ProductVariantEntity, (variant) => variant.productImages, { onDelete: 'CASCADE' })
  productVariant: ProductVariantEntity;

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công Product Image có product: ${this.product.name}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công Product Image có product: ${this.product.name}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công Product Image có product: ${this.product.name}`);
  }
}
