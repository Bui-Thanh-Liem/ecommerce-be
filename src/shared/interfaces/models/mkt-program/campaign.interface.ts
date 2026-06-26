import { IBase } from '../../common/base.interface';
import { IImage } from '../../common/image.interface';
import { IProductVariant } from '../catalog/product-variant.interface';
import { IMainBanner } from '../store-front/main-banner.interface';
import { IMarketingProgram } from './marketing-program.interface';
import { IPromotion } from './promotion.interface';

export interface ICampaign extends IBase {
  name: string;
  slug: string;
  desc: string;
  isActive: boolean;
  mainImage: IImage; // Ảnh chính của chiến dịch
  images: IImage[]; // Max 5 images
  startDate: Date; // Ngày bắt đầu khuyến mãi
  endDate: Date; // Ngày kết thúc khuyến mãi
  productHighlighted: IProductVariant[]; // Danh sách sản phẩm được highlight trong chiến dịch (nếu có)
  marketingProgram?: IMarketingProgram;

  // Relations
  promotions: IPromotion[]; // Mảng chứa ID của các khuyến mãi liên quan đến chiến dịch này
  mainBanners: IMainBanner[]; // Mảng chứa ID của các main banner liên quan đến chiến dịch này
}
