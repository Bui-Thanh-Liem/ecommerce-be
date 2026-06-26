import { CampaignEntity } from '@/modules/marketing-program/campaigns/entities/campaign.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { type IImage } from '@/shared/interfaces/common/image.interface';
import { IMainBanner } from '@/shared/interfaces/models/store-front/main-banner.interface';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('main_banners')
export class MainBannerEntity extends BaseEntity implements IMainBanner {
  @Column({ length: 100, nullable: true })
  desc?: string;

  @Column({ type: 'json' })
  image: IImage;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  campaignSlug: string;

  @ManyToOne(() => CampaignEntity, (c) => c.mainBanners)
  campaign: CampaignEntity;

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công MainBanner có desc: ${this.desc}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công MainBanner có desc: ${this.desc}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công MainBanner có desc: ${this.desc}`);
  }
}
