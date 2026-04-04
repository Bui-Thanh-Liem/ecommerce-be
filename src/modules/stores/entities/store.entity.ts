import { LocationRegionEntity } from 'src/modules/location-regions/entities/location-region.entity';
import { BaseEntity } from 'src/shared/entities/base.entity';
import { IStore } from 'src/shared/interfaces/models/store.interface';
import { IphoneStore } from 'src/shared/interfaces/phone-store.interface';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('stores')
export class StoreEntity extends BaseEntity implements IStore {
  @ManyToOne(() => LocationRegionEntity, (locationRegion) => locationRegion.id, { nullable: false })
  locationRegion: LocationRegionEntity;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column('jsonb')
  phone: IphoneStore[];

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
    console.log(`Đã chèn thành công Store có name: ${this.name}`);
  }
  logUpdate(): void {
    console.log(`Đã cập nhật thành công Store có name: ${this.name}`);
  }
  logRemove(): void {
    console.log(`Đã xóa thành công Store có name: ${this.name}`);
  }
}
