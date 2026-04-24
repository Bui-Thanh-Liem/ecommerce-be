import { CategoryEntity } from '@/modules/categories/entities/category.entity';
import { PromotionEntity } from '@/modules/promotions/entities/promotion.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { ICategoryPromotion } from '@/shared/interfaces/models/category-promotion.interface';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('category_promotions')
export class CategoryPromotionEntity extends BaseEntity implements ICategoryPromotion {
  @ManyToOne(() => CategoryEntity, (category) => category.categoryPromotions)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @ManyToOne(() => PromotionEntity, (p) => p.productPromotions)
  @JoinColumn({ name: 'promotion_id' })
  promotion: PromotionEntity;

  @Column({ default: 0 })
  customDiscount: number;

  @Column({ default: 0 })
  priority: number;

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
