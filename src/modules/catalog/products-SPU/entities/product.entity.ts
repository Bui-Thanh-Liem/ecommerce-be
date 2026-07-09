import { BrandEntity } from '@/modules/catalog/brands/entities/brand.entity';
import { CategoryEntity } from '@/modules/catalog/categories/entities/category.entity';
import { ProductImageEntity } from '@/modules/catalog/product-images/entities/product-image.entity';
import { ProductVariantEntity } from '@/modules/catalog/product-variants-SKU/entities/product-variant.entity';
import { CartItemEntity } from '@/modules/customer/cart-items/entities/cart-item.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { ProductStatus } from '@/shared/enums/product-status.enum';
import { type IImage } from '@/shared/interfaces/common/image.interface';
import { IProduct, ISpecification } from '@/shared/interfaces/models/catalog/product.interface';
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';

@Entity('products')
export class ProductEntity extends BaseEntity implements IProduct {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  desc: string;

  @Column({ unique: true })
  spu: string;

  @Column({ length: 20, unique: true })
  model: string;

  @Column('decimal', { precision: 10, scale: 2 })
  basePrice: number;

  @Column({ type: 'enum', enum: ProductStatus })
  status: ProductStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountPercent: number;

  @ManyToOne(() => CategoryEntity, (category) => category.products, { onDelete: 'SET NULL' })
  category: CategoryEntity;

  @ManyToMany(() => CategoryEntity, (category) => category.secondaryProducts, { onDelete: 'SET NULL', nullable: true })
  @JoinTable({
    name: 'product_secondary_categories',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  secondaryCategories?: CategoryEntity[];

  @ManyToOne(() => BrandEntity, (brand) => brand.products, { onDelete: 'SET NULL' })
  brand: BrandEntity;

  @Column({ type: 'json', nullable: true })
  thumbnail: IImage;

  @Column({ type: 'varchar', nullable: true })
  videoUrl?: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  weight?: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  height?: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  length?: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  width?: number;

  @Column({ nullable: true })
  metaTitle?: string;

  @Column({ nullable: true })
  metaDescription?: string;

  @Column({ nullable: true })
  metaKeywords?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  ratingAvg: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  soldCount: number;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'boolean', default: true })
  allowReview: boolean;

  @Column({ type: 'jsonb', nullable: true })
  specifications: ISpecification[];

  // Quan hệ với ProductVariantEntity, CartItemEntity và ProductImage
  @OneToMany(() => ProductVariantEntity, (variant) => variant.product)
  productVariants?: ProductVariantEntity[];

  @OneToMany(() => CartItemEntity, (cartItem) => cartItem.product)
  cartItems?: CartItemEntity[];

  @OneToMany(() => ProductImageEntity, (image) => image.product, {
    cascade: true, // Thêm cascade để tự động lưu các hình ảnh khi lưu sản phẩm
    orphanedRowAction: 'delete', // Tự động xóa hình ảnh khi không còn liên kết với sản phẩm nào
  })
  productImages?: ProductImageEntity[];

  // Ở Service chỉ cần product.productImages=[{image: {url: string, key: string, provider: string}}] là đủ
  @BeforeInsert()
  @BeforeUpdate()
  assignProductToImages(): void {
    if (this.productImages?.length) {
      this.productImages.forEach((img, idx) => {
        img.product = this; // Gán product cho mỗi hình ảnh
        img.sortOrder = idx; // Tự động gán sortOrder theo thứ tự trong mảng
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
