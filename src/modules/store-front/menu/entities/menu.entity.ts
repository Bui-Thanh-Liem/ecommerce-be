import { CategoryEntity } from '@/modules/catalog/categories/entities/category.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { IMenu } from '@/shared/interfaces/models/store-front/menu.interface';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('menus')
export class MenuEntity extends BaseEntity implements IMenu {
  @Column({ length: 50 })
  name: string;

  @Column({ length: 100, nullable: true })
  desc: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @ManyToOne(() => CategoryEntity, (cate) => cate.menus)
  category: CategoryEntity;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công Menu có name: ${this.name}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công Menu có name: ${this.name}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công Menu có name: ${this.name}`);
  }
}
