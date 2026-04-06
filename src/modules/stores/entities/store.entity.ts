import { InventoryEntity } from '@/modules/inventories/entities/inventory.entity';
import { LocationRegionEntity } from '@/modules/location-regions/entities/location-region.entity';
import { StaffEntity } from '@/modules/staffs/entities/staff.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { IStore } from '@/shared/interfaces/models/store.interface';
import { IPhoneStore } from '@/shared/interfaces/phone-store.interface';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity('stores')
export class StoreEntity extends BaseEntity implements IStore {
  @ManyToOne(() => LocationRegionEntity, (locationRegion) => locationRegion.id, { nullable: false })
  locationRegion: LocationRegionEntity;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  address: string;

  @Column('jsonb')
  phone: IPhoneStore[];

  @OneToMany(() => StaffEntity, (staff) => staff.store)
  staffs: StaffEntity[];

  @OneToMany(() => InventoryEntity, (inventory) => inventory.store, { nullable: true, onDelete: 'SET NULL' })
  inventories?: InventoryEntity[];

  @Column()
  openingHours: string;

  @Column()
  closingHours: string;

  @Column('decimal', { precision: 10, scale: 6 })
  lat: number;

  @Column('decimal', { precision: 10, scale: 6 })
  lng: number;

  @Column({ default: true })
  isActive: boolean;

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công Store có name: ${this.name}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công Store có name: ${this.name}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công Store có name: ${this.name}`);
  }
}
