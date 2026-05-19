import { IBase } from '../base.interface';
import { IImage } from '../image.interface';
import { IProduct } from './product.interface';

export interface IBrand extends IBase {
  name: string;
  slug: string;
  code: string;
  logo: IImage;
  country: string;

  //
  products?: IProduct[] | null;
}
