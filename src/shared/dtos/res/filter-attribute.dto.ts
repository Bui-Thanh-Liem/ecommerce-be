import { IVariantAttribute } from '@/shared/interfaces/models/catalog/product-variant.interface';

export type IFilterAttribute = Pick<IVariantAttribute, 'key' | 'label'> & {
  options: { value: string; desc: string }[];
};
