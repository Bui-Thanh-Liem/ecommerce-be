import { ProductVariantEntity } from '@/modules/catalog/product-variants-SKU/entities/product-variant.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { PromotionApplyType } from '@/shared/enums/promotion-apply-type.enum';
import { IPromotion } from '@/shared/interfaces/models/promotion.interface';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { ProductPromotionEntity } from '../../product-promotions/entities/product-promotion.entity';
import { CampaignEntity } from '../../campaigns/entities/campaign.entity';
import { CategoryPromotionEntity } from '../../category-promotion/entities/category-promotion.entity';
import type { IImage } from '@/shared/interfaces/image.interface';
import { PromotionApplyScope } from '@/shared/enums/promotion-apply-scope.enum';
import { StoreEntity } from '@/modules/inventory/stores/entities/store.entity';
import { LocationRegionEntity } from '@/modules/inventory/location-regions/entities/location-region.entity';

@Entity('promotions')
export class PromotionEntity extends BaseEntity implements IPromotion {
  @ManyToOne(() => CampaignEntity, (campaign) => campaign.promotions)
  @JoinColumn({ name: 'campaign_id' })
  campaign: CampaignEntity;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ type: 'json' })
  image: IImage;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: PromotionApplyType })
  applyType: PromotionApplyType;

  @Column({ type: 'enum', enum: PromotionApplyScope })
  applyScope: PromotionApplyScope;

  @Column({ type: 'float' })
  discountPercentage: number;

  @ManyToMany(() => ProductVariantEntity, (pv) => pv.promotions, { nullable: true })
  productHighlighted?: ProductVariantEntity[] | undefined;

  @Column({ type: 'int', default: 0 })
  limitQuantity: number;

  @Column({ type: 'int', default: 0 })
  totalSoldQuantity: number;

  // Relations
  @ManyToMany(() => StoreEntity, (store) => store.promotions, { nullable: true })
  stores?: StoreEntity[];

  @ManyToMany(() => LocationRegionEntity, (location) => location.promotions, { nullable: true })
  locations?: LocationRegionEntity[]; // Các địa điểm áp dụng (nếu cần)

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
