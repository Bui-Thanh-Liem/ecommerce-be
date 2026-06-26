import { IBase } from '../../common/base.interface';
import { IImage } from '../../common/image.interface';
import { ICampaign } from '../mkt-program/campaign.interface';

export interface IMainBanner extends IBase {
  image: IImage;
  desc?: string;
  isActive: boolean;
  campaign: ICampaign;
  campaignSlug: string;
}
