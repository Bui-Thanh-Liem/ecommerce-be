import { BaseEntity } from 'src/shared/entities/base.entity';
import { LocationRegionType } from 'src/shared/enums/location-regions.enum';
import { ILocationRegion } from 'src/shared/interfaces/models/location-region.interface';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, TreeParent } from 'typeorm';

@Entity('location_regions')
export class LocationRegionEntity extends BaseEntity implements ILocationRegion {
  @Column({ unique: true })
  name: string;

  @Column({ type: 'enum', enum: LocationRegionType })
  type: LocationRegionType;

  @ManyToOne(() => LocationRegionEntity, (region) => region.children, {
    nullable: true,
    onDelete: 'SET NULL', // Quan trọng: Nếu xóa cha, con sẽ thành null thay vì bị xóa theo
    // onDelete: 'CASCADE', // Xóa cha là con "bay màu" luôn
  })
  @JoinColumn({ name: 'parent_id' })
  @TreeParent()
  parent: LocationRegionEntity | null;

  @OneToMany(() => LocationRegionEntity, (region) => region.parent)
  children?: LocationRegionEntity[];

  logInsert(): void {
    console.log(`Đã chèn thành công LocationRegion có name: ${this.name}`);
  }
  logUpdate(): void {
    console.log(`Đã cập nhật thành công LocationRegion có name: ${this.name}`);
  }
  logRemove(): void {
    console.log(`Đã xóa thành công LocationRegion có name: ${this.name}`);
  }
}
