import { PromotionEntity } from '@/modules/promotions/entities/promotion.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { ICampaign } from '@/shared/interfaces/models/campaign.interface';
import { IPromotion } from '@/shared/interfaces/models/promotion.interface';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('campaigns')
export class CampaignEntity extends BaseEntity implements ICampaign {
  @Column({ length: 100 })
  name: string;

  @Column()
  slug: string;

  @Column({ type: 'text' })
  desc: string;

  @Column({ type: 'text' })
  mainImageUrl: string;

  @Column('text', { array: true })
  imageUrls: string[];

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

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
