import { IBase } from '../base.interface';
import { ICategory } from './category.interface';
import { IPromotion } from './promotion.interface';

export interface ICategoryPromotion extends IBase {
  category: ICategory;
  promotion: IPromotion;
  customDiscount: number;
  priority: number;
}
