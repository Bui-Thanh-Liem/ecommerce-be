import { IBase } from '../base.interface';

export interface ICategory extends IBase {
  name: string;
  slug: string;
  desc?: string | null;
  parent?: ICategory | null;
  children?: ICategory[] | null;
}
