import { IBase } from '../common/base.interface';
import { ICategory } from './category.interface';
import { IPromotion } from './promotion.interface';

export interface ICategoryPromotion extends IBase {
  category: ICategory;
  promotion: IPromotion;
  customDiscount: number;
  priority: number;

  limitQuantity: number; // Số lượng tối đa được áp dụng khuyến mãi này (ví dụ: 100 đơn hàng đầu tiên)
  totalSoldQuantity: number; // Số lượng đã bán được áp dụng khuyến mãi này
}
