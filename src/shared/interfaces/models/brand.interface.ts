import { IBase } from '../base.interface';

export interface IBrand extends IBase {
  name: string;
  slug: string;
  logoUrl: string;
  country: string;
}
