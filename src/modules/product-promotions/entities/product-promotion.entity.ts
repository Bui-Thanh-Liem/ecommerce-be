import { ProductVariantEntity } from '@/modules/product-variants-SKU/entities/product-variant.entity';
import { PromotionEntity } from '@/modules/promotions/entities/promotion.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { IProductPromotion } from '@/shared/interfaces/models/product-promotion.interface';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity('product_promotions')
@Index(['productVariant', 'promotion'], { unique: true })
export class ProductPromotionEntity extends BaseEntity implements IProductPromotion {
  @ManyToOne(() => ProductVariantEntity, (pv) => pv.productPromotions)
  @JoinColumn({ name: 'product_variant_id' })
  productVariant: ProductVariantEntity;

  @ManyToOne(() => PromotionEntity, (p) => p.productPromotions)
  @JoinColumn({ name: 'promotion_id' })
  promotion: PromotionEntity;

  @Column({ nullable: true })
  customDiscount: number;

  @Column({ default: 0 })
  priority: number;

  logInsert(): void {
    this.logger.debug(
      // eslint-disable-next-line max-len
      `Đã chèn thành công ProductPromotion có name: ${this.promotion.applyType} cho ProductVariant có sku: ${this.productVariant.sku}`,
    );
  }

  logUpdate(): void {
    this.logger.debug(
      // eslint-disable-next-line max-len
      `Đã cập nhật thành công ProductPromotion có name: ${this.promotion.applyType} cho ProductVariant có sku: ${this.productVariant.sku}`,
    );
  }

  logRemove(): void {
    this.logger.debug(
      // eslint-disable-next-line max-len
      `Đã xóa thành công ProductPromotion có name: ${this.promotion.applyType} cho ProductVariant có sku: ${this.productVariant.sku}`,
    );
  }
}
