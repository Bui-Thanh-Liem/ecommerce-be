import { IBase } from '../base.interface';
import { IProduct } from './product.interface';

export interface ICategory extends IBase {
  name: string;
  slug: string;
  imageUrl: string;
  code: string;
  desc?: string | null;
  parent?: ICategory | null;
  children?: ICategory[] | null;

  //
  products?: IProduct[] | null;
}
