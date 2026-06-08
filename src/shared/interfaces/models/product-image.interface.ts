import { IBase } from '../common/base.interface';
import { IImage } from '../common/image.interface';
import { IProductVariant } from './product-variant.interface';
import { IProduct } from './product.interface';

export interface IProductImage extends IBase {
  image: IImage;
  product: IProduct;
  sortOrder: number;
  isThumbnail: boolean;
  productVariant: IProductVariant;
}
