import { BaseEntity } from '@/shared/entities/base.entity';
import { MarketingProgramStatus } from '@/shared/enums/marketing-program-status.enum';
import { IMarketingProgram } from '@/shared/interfaces/models/mkt-program/marketing-program.interface';
import { Column, Entity, OneToMany } from 'typeorm';
import { CampaignEntity } from '../../campaigns/entities/campaign.entity';
import { type IImage } from '@/shared/interfaces/common/image.interface';

@Entity('marketing_programs')
export class MarketingProgramEntity extends BaseEntity implements IMarketingProgram {
  @Column({ length: 100 })
  name: string;

  @Column({ length: 200, unique: true })
  slug: string;

  @Column({ length: 255, nullable: true })
  desc?: string;

  @Column({ type: 'json', nullable: true })
  mainImage?: IImage | null;

  @Column({ type: 'enum', enum: MarketingProgramStatus, default: MarketingProgramStatus.DRAFT })
  status: MarketingProgramStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budget?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  spentBudget?: number;

  @Column({ type: 'int', nullable: true })
  totalOrders?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalRevenue?: number;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  // Relations
  @OneToMany(() => CampaignEntity, (c) => c.marketingProgram)
  campaigns: CampaignEntity[];

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công MarketingProgram có slug: ${this.name}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công MarketingProgram có slug: ${this.name}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công MarketingProgram có slug: ${this.name}`);
  }
}
