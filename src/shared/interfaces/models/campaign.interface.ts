import { IBase } from '../base.interface';
import { IPromotion } from './promotion.interface';

export interface ICampaign extends IBase {
  name: string;
  slug: string;
  desc: string;
  mainImageUrl: string;
  imageUrls: string[]; // Max 5 images
  startDate: Date; // Ngày bắt đầu khuyến mãi
  endDate: Date; // Ngày kết thúc khuyến mãi

  promotions: IPromotion[]; // Mảng chứa ID của các khuyến mãi liên quan đến chiến dịch này
}
