import { IBase } from '../../common/base.interface';
import { ICategory } from '../catalog/category.interface';
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
  topBanner: Pick<ITopBanner, 'id' | 'slug' | 'title' | 'image'> | null;
  header: string; // Không có đối tượng cấu hình động cho header
  menu: Pick<IMenu, 'id' | 'slug' | 'name' | 'link'>[];
  mainBanner: Pick<IMainBanner, 'id' | 'slug' | 'title' | 'image'>[];
  listCategories: Pick<ICategory, 'id' | 'slug' | 'name' | 'image'>[];
  historyProducts: string; // Không có đối tượng cấu hình động cho historyProducts
  marketingProgram01: {
    title: string;
    mktPrograms: Pick<IMarketingProgram, 'id' | 'slug' | 'name' | 'mainImage'>[];
  };
  marketingProgram02: {
    campaigns: Pick<ICampaign, 'id' | 'slug' | 'name' | 'mainImage'>[];
  };
  marketingProgram03: {
    title: string;
    mktPrograms: Pick<IMarketingProgram, 'id' | 'slug' | 'name' | 'mainImage'>[];
  };
  suggestForYou: string; // Không có đối tượng cấu hình động cho suggestForYou
  marketingProgram04: {
    title: string;
    campaign: Pick<ICampaign, 'id' | 'slug' | 'name' | 'mainImage'> | null;
  };
  marketingProgram05: {
    title: string;
    campaign: Pick<ICampaign, 'id' | 'slug' | 'name' | 'mainImage'> | null;
  };
  marketingProgram06: {
    title: string;
    campaigns: Pick<ICampaign, 'id' | 'slug' | 'name' | 'mainImage'>[];
  };
  topic: {
    title: string;
    topics: string[];
  };
}
