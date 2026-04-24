import { CampaignEntity } from '@/modules/campaigns/entities/campaign.entity';
import { CategoryPromotionEntity } from '@/modules/category-promotion/entities/category-promotion.entity';
import { ProductPromotionEntity } from '@/modules/product-promotions/entities/product-promotion.entity';
import { ProductVariantEntity } from '@/modules/product-variants-SKU/entities/product-variant.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { PromotionApplyType } from '@/shared/enums/promotion-apply-type.enum';
import { IPromotion } from '@/shared/interfaces/models/promotion.interface';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';

@Entity('promotions')
export class PromotionEntity extends BaseEntity implements IPromotion {
  @Column({ type: 'int', default: 0 })
  totalUsed: number;

  @Column({ type: 'int', default: 0 })
  maxUsagePerUser: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 100 })
  slug: string;

  @ManyToOne(() => CampaignEntity, (campaign) => campaign.promotions)
  @JoinColumn({ name: 'campaign_id' })
  campaign: CampaignEntity;

  @Column({ type: 'text' })
  imageUrl: string;

  @Column({ type: 'enum', enum: PromotionApplyType })
  applyType: PromotionApplyType;

  @Column({ type: 'float' })
  discountPercentage: number;

  // Relations
  @ManyToMany(() => ProductVariantEntity, (pv) => pv.promotions, { nullable: true })
  productHighlighted?: ProductVariantEntity[] | undefined;

  @OneToMany(() => ProductPromotionEntity, (productPromotion) => productPromotion.promotion, { nullable: true })
  productPromotions?: ProductPromotionEntity[];

  @OneToMany(() => CategoryPromotionEntity, (categoryPromotion) => categoryPromotion.promotion, { nullable: true })
  categoryPromotions?: CategoryPromotionEntity[];

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công Promotion có slug: ${this.applyType}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công Promotion có slug: ${this.applyType}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công Promotion có slug: ${this.applyType}`);
  }
}
