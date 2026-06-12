import { IBase } from '../../common/base.interface';
import { IImage } from '../../common/image.interface';
import { IProduct } from './product.interface';

export interface IBrand extends IBase {
  name: string;
  slug: string;
  code: string;
  image: IImage;
  country: string;

  //
  products?: IProduct[] | null;
}
