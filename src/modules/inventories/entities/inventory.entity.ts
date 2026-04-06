import { ProductEntity } from '@/modules/products-SPU/entities/product.entity';
import { StoreEntity } from '@/modules/stores/entities/store.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { InventoryStockType } from '@/shared/enums/inventory-stock-type.enum';
import { IInventory } from '@/shared/interfaces/models/inventory.interface';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('inventories')
export class InventoryEntity extends BaseEntity implements IInventory {
  @ManyToOne(() => StoreEntity, (store) => store.inventories)
  store: StoreEntity;

  @ManyToOne(() => ProductEntity, (product) => product.inventories)
  product: ProductEntity;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  minStockLevel: number;

  @Column({ type: 'enum', enum: InventoryStockType })
  stockType: InventoryStockType;

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công Inventory có product: ${this.product.name}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công Inventory có product: ${this.product.name}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công Inventory có product: ${this.product.name}`);
  }
}
