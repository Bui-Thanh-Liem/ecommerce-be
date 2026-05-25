import { BaseEntity } from '@/shared/entities/base.entity';
import { LocationRegionType } from '@/shared/enums/location-region-type.enum';
import { ILocationRegion } from '@/shared/interfaces/models/location-region.interface';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, TreeParent } from 'typeorm';

@Entity('location_regions')
export class LocationRegionEntity extends BaseEntity implements ILocationRegion {
  @Column({ unique: true, type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: LocationRegionType })
  type: LocationRegionType;

  @ManyToOne(() => LocationRegionEntity, (region) => region.children, {
    nullable: true,
    onDelete: 'SET NULL', // Quan trọng: Nếu xóa cha, con sẽ thành null thay vì bị xóa theo
    // onDelete: 'CASCADE', // Xóa cha là con "bay màu" luôn
  })
  @JoinColumn({ name: 'parent' })
  @TreeParent()
  parent: LocationRegionEntity | null;

  @OneToMany(() => LocationRegionEntity, (region) => region.parent)
  children?: LocationRegionEntity[];

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công LocationRegion có name: ${this.name}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công LocationRegion có name: ${this.name}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công LocationRegion có name: ${this.name}`);
  }
}
