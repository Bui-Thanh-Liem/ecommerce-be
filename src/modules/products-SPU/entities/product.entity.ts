import { BrandEntity } from '@/modules/brands/entities/brand.entity';
import { CategoryEntity } from '@/modules/categories/entities/category.entity';
import { ProductVariantEntity } from '@/modules/product-variants-SKU/entities/product-variant.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { ProductStatus } from '@/shared/enums/product-status.enum';
import { IProduct } from '@/shared/interfaces/models/product.interface';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

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

  @OneToMany(() => ProductVariantEntity, (variant) => variant.product)
  productVariants?: ProductVariantEntity[];

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
