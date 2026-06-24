import { IBase } from '../../common/base.interface';
import { ICategory } from '../catalog/category.interface';

export interface IMenu extends IBase {
  name: string;
  isActive: boolean;
  category: ICategory;
  categorySlug: string;
}
