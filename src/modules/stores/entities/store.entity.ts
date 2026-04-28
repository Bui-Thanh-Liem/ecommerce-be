import { InventoryEntity } from '@/modules/inventories/entities/inventory.entity';
import { LocationRegionEntity } from '@/modules/location-regions/entities/location-region.entity';
import { RoleEntity } from '@/modules/roles/entities/role.entity';
import { StaffEntity } from '@/modules/staffs/entities/staff.entity';
import { VoucherEntity } from '@/modules/vouchers/entities/voucher.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { IStore } from '@/shared/interfaces/models/store.interface';
import { IPhoneStore } from '@/shared/interfaces/phone-store.interface';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne } from 'typeorm';

@Entity('stores')
export class StoreEntity extends BaseEntity implements IStore {
  @ManyToOne(() => LocationRegionEntity, (locationRegion) => locationRegion.id, {
    nullable: false,
    onDelete: 'SET NULL',
  })
  provinceCity: LocationRegionEntity;

  @ManyToOne(() => LocationRegionEntity, (locationRegion) => locationRegion.id, {
    nullable: false,
    onDelete: 'SET NULL',
  })
  districtTown: LocationRegionEntity;

  @ManyToOne(() => LocationRegionEntity, (locationRegion) => locationRegion.id, {
    nullable: false,
    onDelete: 'SET NULL',
  })
  wardCommune: LocationRegionEntity;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  address: string;

  @Column('jsonb')
  phone: IPhoneStore[];

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

  @OneToOne(() => StaffEntity, (staff) => staff.managedStore)
  @JoinColumn()
  manager: StaffEntity;

  //
  @OneToMany(() => StaffEntity, (staff) => staff.store)
  staffs: StaffEntity[];

  @OneToMany(() => InventoryEntity, (inventory) => inventory.store, { nullable: true, onDelete: 'SET NULL' })
  inventories?: InventoryEntity[];

  @OneToMany(() => VoucherEntity, (voucher) => voucher.store, { nullable: true, onDelete: 'SET NULL' })
  vouchers?: VoucherEntity[];

  @ManyToMany(() => RoleEntity, (role) => role.stores, { nullable: true })
  roles?: RoleEntity[] | undefined;

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
