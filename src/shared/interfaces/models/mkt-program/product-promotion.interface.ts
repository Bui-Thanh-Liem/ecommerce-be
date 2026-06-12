import { IBase } from '../../common/base.interface';
import { IProductVariant } from '../catalog/product-variant.interface';
import { IPromotion } from './promotion.interface';

export interface IProductPromotion extends IBase {
  productVariant: IProductVariant;
  promotion: IPromotion;
  customDiscount: number;
  priority: number;

  limitQuantity: number; // Số lượng tối đa được áp dụng khuyến mãi này (ví dụ: 100 đơn hàng đầu tiên)
  totalSoldQuantity: number; // Số lượng đã bán được áp dụng khuyến mãi này
}
