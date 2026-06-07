import { IBase } from '../base.interface';
import { IImage } from '../image.interface';
import { ICategoryPromotion } from './category-promotion.interface';
import { IProduct } from './product.interface';

export interface ICategory extends IBase {
  name: string;
  slug: string;
  code: string;
  image?: IImage;
  minPrice?: number;
  desc?: string | null;
  parent?: ICategory | null;
  children?: ICategory[] | null;

  //
  products?: IProduct[] | null;
  categoryPromotions?: ICategoryPromotion[] | null;
}
