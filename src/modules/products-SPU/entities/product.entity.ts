import { InventoryEntity } from '@/modules/inventories/entities/inventory.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { IInventory } from '@/shared/interfaces/models/inventory.interface';
import { IProduct } from '@/shared/interfaces/models/product.interface';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('products')
export class ProductEntity extends BaseEntity implements IProduct {
  @Column()
  name: string;

  @OneToMany(() => InventoryEntity, (inventory) => inventory.product, { nullable: true, onDelete: 'SET NULL' })
  inventories?: IInventory[];

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
