import { ProductStatus } from '@/shared/enums/product-status.enum';
import { IBase } from '../base.interface';
import { ICategory } from './category.interface';
import { IBrand } from './brand.interface';
import { IProductVariant } from './product-variant.interface';

export interface IProduct extends IBase {
  name: string;
  slug: string;
  desc: string;
  spu: string;
  basePrice: number;
  status: ProductStatus;
  category: ICategory;
  brand: IBrand;

  //
  productVariants?: IProductVariant[];
}
