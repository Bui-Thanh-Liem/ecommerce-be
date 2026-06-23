import { IBase } from '../../common/base.interface';
import { ICategory } from '../catalog/category.interface';
import { ICampaign } from '../mkt-program/campaign.interface';
import { IMarketingProgram } from '../mkt-program/marketing-program.interface';
import { IMainBanner } from './main-banner.interface';
import { IMenu } from './menu.interface';
import { IPopularSearch } from './popular-search.interface';
import { ITopBanner } from './top-banner.interface';

export interface IStoreFrontConfig extends IBase {
  homeConfig: IConfigHome;
}

export interface IConfigHome {
  order: (keyof IDetailHomeConfig)[]; // Mảng chứa thứ tự các block, ví dụ: ["topBanner", "header", "menu", ...]
  config: IDetailHomeConfig; // Đối tượng chứa cấu hình chi tiết cho từng block
}

type CampaignOption = Pick<ICampaign, 'id' | 'slug' | 'name' | 'mainImage'>;
type MktProgramOption = Pick<IMarketingProgram, 'id' | 'slug' | 'name' | 'mainImage'>;
type MenuOption = Pick<IMenu, 'id' | 'name' | 'category'>;
type PopularSearchOption = Pick<IPopularSearch, 'id' | 'text'>;

export interface IDetailHomeConfig {
  topBanner: Pick<ITopBanner, 'id' | 'slug' | 'title' | 'image'> | null;
  header: string; // Không có đối tượng cấu hình động cho header
  menu: MenuOption[];
  mainBanner: Pick<IMainBanner, 'id' | 'slug' | 'title' | 'image'>[];
  listCategories: Pick<ICategory, 'id' | 'slug' | 'name' | 'image' | 'minPrice'>[];
  historyProducts: string; // Không có đối tượng cấu hình động cho historyProducts
  marketingProgram01: {
    title: string;
    mktPrograms: MktProgramOption[];
  };
  marketingProgram02: {
    campaigns: CampaignOption[];
  };
  marketingProgram03: {
    title: string;
    mktPrograms: MktProgramOption[];
  };
  suggestForYou: string; // Không có đối tượng cấu hình động cho suggestForYou
  marketingProgram04: {
    title: string;
    campaign: CampaignOption | null;
  };
  marketingProgram05: {
    title: string;
    campaign: CampaignOption | null;
  };
  marketingProgram06: {
    title: string;
    campaigns: CampaignOption[];
  };
  popularSearch: {
    title: string;
    searches: PopularSearchOption[];
  };
}
