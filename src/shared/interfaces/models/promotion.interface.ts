import { PromotionApplyType } from '@/shared/enums/promotion-apply-type.enum';
import { IBase } from '../base.interface';
import { IProductPromotion } from './product-promotion.interface';
import { IProductVariant } from './product-variant.interface';
import { ICampaign } from './campaign.interface';
import { ICategoryPromotion } from './category-promotion.interface';

export interface IPromotion extends IBase {
  name: string; // Tủ lạnh, TIVI giảm sốc, ...
  slug: string;
  imageUrl: string;
  applyType: PromotionApplyType;
  discountPercentage: number; // Phần trăm giảm giá (ví dụ: 20 cho giảm giá 20%)
  productHighlighted?: IProductVariant[]; // Sản phẩm được làm nổi bật trong chiến dịch Max 5
  totalUsed: number;
  maxUsagePerUser: number;
  campaign: ICampaign; // ID của chiến dịch mà khuyến mãi này thuộc về

  //
  productPromotions?: IProductPromotion[]; // Mối quan hệ với ProductPromotion (nếu cần)
  categoryPromotions?: ICategoryPromotion[]; // Mối quan hệ với CategoryPromotion (nếu cần)
}
