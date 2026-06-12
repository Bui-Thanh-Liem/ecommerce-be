import { MarketingProgramStatus } from '@/shared/enums/marketing-program-status.enum';
import { IBase } from '../common/base.interface';
import { ICampaign } from './campaign.interface';
import { IImage } from '../common/image.interface';

export interface IMarketingProgram extends IBase {
  // Thông tin cơ bản
  name: string;
  slug: string;
  mainImage: IImage;
  desc?: string;

  // Thời gian
  startDate: Date;
  endDate: Date;

  // Trạng thái
  status: MarketingProgramStatus;

  // Ngân sách
  budget?: number; // Ngân sách dự kiến cho chương trình tiếp thị
  spentBudget?: number; //  Ngân sách đã chi tiêu cho chương trình tiếp thị

  // Thống kê
  totalOrders?: number; // Tổng số đơn hàng đã phát sinh từ các chiến dịch trong chương trình tiếp thị
  totalRevenue?: number; // Tổng doanh thu đã tạo ra từ các chiến dịch trong chương trình tiếp thị

  // Quan hệ
  campaigns?: ICampaign[];
}
