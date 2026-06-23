import { IBase } from '../../common/base.interface';
import { IImage } from '../../common/image.interface';
import { ICategoryPromotion } from '../mkt-program/category-promotion.interface';
import { IMenu } from '../store-front/menu.interface';
import { IProduct } from './product.interface';

export interface ICategory extends IBase {
  name: string;
  slug: string;
  code: string;
  minPrice?: number;
  desc?: string | null;
  image?: IImage | null;
  imageInPage?: IImage | null;
  parent?: ICategory | null;
  children?: ICategory[] | null;

  //
  products?: IProduct[] | null;
  menus?: IMenu[] | null;
  secondaryProducts?: IProduct[] | null;
  categoryPromotions?: ICategoryPromotion[] | null;
}
