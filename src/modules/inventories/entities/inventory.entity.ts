import { ProductVariantEntity } from '@/modules/product-variants-SKU/entities/product-variant.entity';
import { StoreEntity } from '@/modules/stores/entities/store.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { InventoryStockType } from '@/shared/enums/inventory-stock-type.enum';
import { IInventory } from '@/shared/interfaces/models/inventory.interface';
import { Column, Entity, Index, ManyToOne } from 'typeorm';

@Entity('inventories')
@Index(['store', 'productVariant'], { unique: true })
export class InventoryEntity extends BaseEntity implements IInventory {
  @ManyToOne(() => StoreEntity, (store) => store.inventories)
  store: StoreEntity;

  @ManyToOne(() => ProductVariantEntity, (productVariant) => productVariant.inventories)
  productVariant: ProductVariantEntity;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  minStockLevel: number;

  @Column({ type: 'enum', enum: InventoryStockType })
  stockType: InventoryStockType;

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công Inventory có product: ${this.productVariant.sku}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công Inventory có product: ${this.productVariant.sku}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công Inventory có product: ${this.productVariant.sku}`);
  }
}
