import { CategoryPromotionEntity } from '@/modules/category-promotion/entities/category-promotion.entity';
import { ProductEntity } from '@/modules/products-SPU/entities/product.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { ICategory } from '@/shared/interfaces/models/category.interface';
import { stringToSlug } from '@/utils/string-to-slug.util';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, TreeParent } from 'typeorm';

@Entity('categories')
export class CategoryEntity extends BaseEntity implements ICategory {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  desc?: string | null;

  @Column({ unique: true, type: 'varchar', length: 150 })
  slug: string;

  @Column({ type: 'text' })
  imageUrl: string;

  @Column({ type: 'varchar', length: 150 })
  code: string;

  @ManyToOne(() => CategoryEntity, (c) => c.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent' })
  @TreeParent()
  parent?: CategoryEntity | null;

  @OneToMany(() => CategoryEntity, (category) => category.parent)
  children?: CategoryEntity[] | null;

  //
  @OneToMany(() => ProductEntity, (product) => product.category)
  products?: ProductEntity[] | null;

  @OneToMany(() => CategoryPromotionEntity, (categoryPromotion) => categoryPromotion.category, { nullable: true })
  categoryPromotions?: CategoryPromotionEntity[];

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công Category có name: ${this.name}`);
  }
  logUpdate(): void {
    if (!this.name) this.slug = stringToSlug(this.name);
    this.logger.debug(`Đã cập nhật thành công Category có name: ${this.name}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công Category có name: ${this.name}`);
  }
}
