import { IBase } from '../common/base.interface';
import { IProductVariant } from './product-variant.interface';
import { IPromotion } from './promotion.interface';

export interface IProductPromotion extends IBase {
  productVariant: IProductVariant;
  promotion: IPromotion;
  customDiscount: number;
  priority: number;
}
