import { InventoryEntity } from '@/modules/inventories/entities/inventory.entity';
import { ProductItemEntity } from '@/modules/product-items-SERIAL/entities/product-item.entity';
import { ProductEntity } from '@/modules/products-SPU/entities/product.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { ProductVariantCondition } from '@/shared/enums/product-variant-condition.enum';
import { IProductVariant, ISpecification } from '@/shared/interfaces/models/product-variant.interface';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity('product_variants')
export class ProductVariantEntity extends BaseEntity implements IProductVariant {
  @ManyToOne(() => ProductEntity, (prod) => prod.productVariants)
  product: ProductEntity;

  @Column({ unique: true })
  sku: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  soldCount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  discountPrice: number;

  @Column({ type: 'enum', enum: ProductVariantCondition })
  conditions: ProductVariantCondition;

  @Column({ type: 'jsonb', nullable: true })
  specifications: ISpecification[];

  @OneToMany(() => InventoryEntity, (inventory) => inventory.productVariant, { nullable: true, onDelete: 'SET NULL' })
  inventories?: InventoryEntity[];

  @OneToMany(() => ProductItemEntity, (productItem) => productItem.productVariant, { nullable: true })
  productItems?: ProductItemEntity[];

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công ProductVariant có sku: ${this.sku}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công ProductVariant có sku: ${this.sku}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công ProductVariant có sku: ${this.sku}`);
  }
}
