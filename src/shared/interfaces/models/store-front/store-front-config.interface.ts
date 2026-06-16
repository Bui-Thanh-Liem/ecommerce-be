import { IBase } from '../../common/base.interface';
import { ICategory } from '../catalog/category.interface';
import { IProductVariant } from '../catalog/product-variant.interface';
import { ICampaign } from '../mkt-program/campaign.interface';
import { IMarketingProgram } from '../mkt-program/marketing-program.interface';
import { IMainBanner } from './main-banner.interface';
import { IMenu } from './menu.interface';
import { ITopBanner } from './top-banner.interface';

export interface IStoreFrontConfig extends IBase {
  homeConfig: IConfigHome;
}

export interface IConfigHome {
  order: (keyof IDetailHomeConfig)[]; // Mảng chứa thứ tự các block, ví dụ: ["topBanner", "header", "menu", ...]
  config: IDetailHomeConfig; // Đối tượng chứa cấu hình chi tiết cho từng block
}

export interface IDetailHomeConfig {
  topBanner: Partial<ITopBanner>;
  header: string; // Không có đối tượng cấu hình động cho header
  menu: Partial<IMenu>[];
  mainBanner: Partial<IMainBanner>[];
  listCategories: Partial<ICategory>[];
  historyProducts: Partial<IProductVariant>[];
  mktSessionOne: {
    title: string;
    mktPrograms: Partial<IMarketingProgram>[];
  };
  mktSessionTwo: {
    title: string;
    mktPrograms: Partial<IMarketingProgram>[];
  };
  suggestForYou: Partial<IProductVariant>[];
  mktSessionThree: {
    title: string;
    campaign: Partial<ICampaign>;
  };
  mktSessionFour: {
    title: string;
    campaign: Partial<ICampaign>;
  };
  mktSessionFive: {
    title: string;
    campaigns: Partial<ICampaign>[];
  };
  topic: {
    title: string;
    topics: string[];
  };
}
