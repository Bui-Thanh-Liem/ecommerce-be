import { IBase } from '../../common/base.interface';
import { IImage } from '../../common/image.interface';

export interface ITopBanner extends IBase {
  title: string;
  slug: string;
  desc?: string;
  image: IImage;
  isActive: boolean;
}
