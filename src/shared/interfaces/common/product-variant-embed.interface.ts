import { IProductVariant } from '../models/catalog/product-variant.interface';
import { IBase } from './base.interface';

export interface IProductVariantEmbed extends IBase {
  productVariantId: string;
  productVariant: IProductVariant;
  embedding: number[];
  dataToEmbed: any;
}
