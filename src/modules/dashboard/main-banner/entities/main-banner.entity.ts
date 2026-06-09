import { BaseEntity } from '@/shared/entities/base.entity';
import { type IImage } from '@/shared/interfaces/common/image.interface';
import { IMainBanner } from '@/shared/interfaces/models/main-banner.interface';
import { Column, Entity } from 'typeorm';

@Entity('main_banners')
export class MainBannerEntity extends BaseEntity implements IMainBanner {
  @Column({ length: 50 })
  title: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ length: 100, nullable: true })
  desc?: string;

  @Column({ type: 'json' })
  image: IImage;

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công MainBanner có title: ${this.title}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công MainBanner có title: ${this.title}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công MainBanner có title: ${this.title}`);
  }
}
