import { BrandEntity } from '@/modules/brands/entities/brand.entity';
import { CartItemEntity } from '@/modules/cart-items/entities/cart-item.entity';
import { CategoryEntity } from '@/modules/categories/entities/category.entity';
import { ProductImageEntity } from '@/modules/product-images/entities/product-image.entity';
import { ProductVariantEntity } from '@/modules/product-variants-SKU/entities/product-variant.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { ProductStatus } from '@/shared/enums/product-status.enum';
import { IProduct } from '@/shared/interfaces/models/product.interface';
import { BeforeInsert, Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity('products')
export class ProductEntity extends BaseEntity implements IProduct {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  desc: string;

  @Column('decimal', { precision: 10, scale: 2 })
  basePrice: number;

  @Column({ type: 'enum', enum: ProductStatus })
  status: ProductStatus;

  @ManyToOne(() => CategoryEntity, (category) => category.products, { onDelete: 'SET NULL' })
  category: CategoryEntity;

  @ManyToOne(() => BrandEntity, (brand) => brand.products, { onDelete: 'SET NULL' })
  brand: BrandEntity;

  @Column({ unique: true })
  spu: string;

  // Quan hệ với ProductVariantEntity, CartItemEntity và ProductImage
  @OneToMany(() => ProductVariantEntity, (variant) => variant.product)
  productVariants?: ProductVariantEntity[];

  @OneToMany(() => CartItemEntity, (cartItem) => cartItem.product)
  cartItems?: CartItemEntity[];

  // eslint-disable-next-line max-len
  @OneToMany(() => ProductImageEntity, (image) => image.product, { cascade: true }) // Thêm cascade để tự động lưu các hình ảnh khi lưu sản phẩm
  productImages?: ProductImageEntity[];

  // Ở Service chỉ cần product.productImages=[{url: string}] là đủ
  @BeforeInsert()
  assignProductToImages(): void {
    if (this.productImages?.length) {
      this.productImages.forEach((img, idx) => {
        img.sortOrder = idx; // Tự động gán sortOrder theo thứ tự trong mảng
        img.product = this; // Gán product cho mỗi hình ảnh
        img.isThumbnail = idx === 0; // Tự động đánh dấu hình ảnh đầu tiên là thumbnail
      });
    }
  }

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công Product có name: ${this.name}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công Product có name: ${this.name}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công Product có name: ${this.name}`);
  }
}
