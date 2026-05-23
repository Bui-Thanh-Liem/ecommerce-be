import { InventoryEntity } from '@/modules/inventories/entities/inventory.entity';
import { ProductVariantEntity } from '@/modules/product-variants-SKU/entities/product-variant.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { ProductItemStatus } from '@/shared/enums/product-item-status.enum';
import { IProductItem } from '@/shared/interfaces/models/product-item.interface';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('product_items')
export class ProductItemEntity extends BaseEntity implements IProductItem {
  @ManyToOne(() => ProductVariantEntity, (variant) => variant.productItems, {
    nullable: false,
    onDelete: 'CASCADE', // Quan trọng: xóa variant thì xóa hết item
  })
  productVariant: ProductVariantEntity;

  @ManyToOne(() => InventoryEntity, (inventory) => inventory.productItems)
  inventory: InventoryEntity;

  @Column({ unique: true })
  serialNumber: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  purchasePrice?: number;

  @Column({ type: 'timestamp' })
  importDate: Date;

  @Column({ type: 'enum', enum: ProductItemStatus })
  status: ProductItemStatus;

  @Column({ type: 'timestamp', nullable: true })
  warrantyActivatedAt?: Date;

  // ============================
  // order:

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công ProductVariant có sku: ${this.serialNumber}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công ProductVariant có sku: ${this.serialNumber}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công ProductVariant có sku: ${this.serialNumber}`);
  }
}
