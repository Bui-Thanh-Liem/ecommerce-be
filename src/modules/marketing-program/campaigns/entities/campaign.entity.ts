import { PromotionEntity } from '@/modules/marketing-program/promotions/entities/promotion.entity';
import { ProductVariantEntity } from '@/modules/catalog/product-variants-SKU/entities/product-variant.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import type { IImage } from '@/shared/interfaces/common/image.interface';
import { ICampaign } from '@/shared/interfaces/models/campaign.interface';
import { IPromotion } from '@/shared/interfaces/models/promotion.interface';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { MarketingProgramEntity } from '../../marketing-programs/entities/marketing-program.entity';

@Entity('campaigns')
export class CampaignEntity extends BaseEntity implements ICampaign {
  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column()
  desc: string;

  @Column({ type: 'json' })
  mainImage: IImage;

  @Column({ type: 'json' })
  images: IImage[];

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @ManyToMany(() => ProductVariantEntity, (pv) => pv.campaigns, { nullable: true })
  @JoinTable({
    name: 'campaign_product_highlighted',
    joinColumn: { name: 'campaign_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'product_variant_id', referencedColumnName: 'id' },
  })
  productHighlighted: ProductVariantEntity[];

  @ManyToOne(() => MarketingProgramEntity, (mp) => mp.campaigns, { nullable: true })
  marketingProgram?: MarketingProgramEntity;

  // Relations
  @OneToMany(() => PromotionEntity, (promotion) => promotion.campaign)
  promotions: IPromotion[];

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công Campaign có slug: ${this.name}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công Campaign có slug: ${this.name}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công Campaign có slug: ${this.name}`);
  }
}
