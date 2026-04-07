import { IBase } from '../base.interface';
import { IProduct } from './product.interface';

export interface IBrand extends IBase {
  name: string;
  slug: string;
  code: string;
  logoUrl: string;
  country: string;

  //
  products?: IProduct[] | null;
}
