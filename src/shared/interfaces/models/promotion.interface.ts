import { PromotionApplyType } from '@/shared/enums/promotion-apply-type.enum';
import { IBase } from '../common/base.interface';
import { IProductPromotion } from './product-promotion.interface';
import { IProductVariant } from './product-variant.interface';
import { ICampaign } from './campaign.interface';
import { ICategoryPromotion } from './category-promotion.interface';
import { IStore } from './store.interface';
import { ILocationRegion } from './location-region.interface';
import { PromotionApplyScope } from '@/shared/enums/promotion-apply-scope.enum';
import { IImage } from '../common/image.interface';

export interface IPromotion extends IBase {
  campaign: ICampaign; // ID của chiến dịch mà khuyến mãi này thuộc về

  name: string; // Tủ lạnh, TIVI giảm sốc, ...
  slug: string;
  image: IImage;
  isActive: boolean;
  applyType: PromotionApplyType;
  applyScope: PromotionApplyScope; // Phạm vi áp dụng của khuyến mãi
  discountPercentage: number; // Phần trăm giảm giá (ví dụ: 20 cho giảm giá 20%)
  productHighlighted?: IProductVariant[]; // Sản phẩm được làm nổi bật trong chiến dịch Max 5

  //
  limitQuantity: number; // Số lượng tối đa được áp dụng khuyến mãi này (ví dụ: 100 đơn hàng đầu tiên)
  totalSoldQuantity: number; // Số lượng đã bán được áp dụng khuyến mãi này

  stores?: IStore[]; // Nếu khuyến mãi chỉ áp dụng cho một cửa hàng cụ thể, liên kết đến cửa hàng đó
  locations?: ILocationRegion[]; // Các địa điểm áp dụng (nếu cần)

  //
  productPromotions?: IProductPromotion[]; // Mối quan hệ với ProductPromotion (nếu cần)
  categoryPromotions?: ICategoryPromotion[]; // Mối quan hệ với CategoryPromotion (nếu cần)
}
