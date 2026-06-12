import { CategoryEntity } from '@/modules/catalog/categories/entities/category.entity';
import { PromotionEntity } from '@/modules/marketing-program/promotions/entities/promotion.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { ICategoryPromotion } from '@/shared/interfaces/models/mkt-program/category-promotion.interface';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity('category_promotions')
@Index(['category', 'promotion'], { unique: true })
export class CategoryPromotionEntity extends BaseEntity implements ICategoryPromotion {
  @ManyToOne(() => CategoryEntity, (category) => category.categoryPromotions)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @ManyToOne(() => PromotionEntity, (p) => p.categoryPromotions)
  @JoinColumn({ name: 'promotion_id' })
  promotion: PromotionEntity;

  @Column({ default: 0 })
  customDiscount: number;

  @Column({ default: 0 })
  priority: number;

  @Column({ type: 'int', default: 0 })
  limitQuantity: number;

  @Column({ type: 'int', default: 0 })
  totalSoldQuantity: number;

  logInsert(): void {
    this.logger.debug(
      `Đã chèn thành công Category có name: ${this.category.name} với Promotion có name: ${this.promotion.applyType}`,
    );
  }
  logUpdate(): void {
    this.logger.debug(
      // eslint-disable-next-line max-len
      `Đã cập nhật thành công Category có name: ${this.category.name} với Promotion có name: ${this.promotion.applyType}`,
    );
  }
  logRemove(): void {
    this.logger.debug(
      // eslint-disable-next-line max-len
      `Đã xóa thành công Category có name: ${this.category.name} với Promotion có name: ${this.promotion.applyType}`,
    );
  }
}
