import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { Expose, Type } from 'class-transformer';
import { MenuDto } from '../../menu/dto/menu.dto';
import { TopBannerDto } from '../../top-banners/dto/top-banner.dto';
import { MainBannerDto } from '../../main-banner/dto/main-banner.dto';
import { CategoryDto } from '@/modules/catalog/categories/dto/category.dto';
import { MktProgramDto } from '@/modules/marketing-program/marketing-programs/dto/mkt-program.dto';
import { CampaignDto } from '@/modules/marketing-program/campaigns/dto/campaign.dto';
import { PopularSearchDto } from '../../popular-search/dto/popular-search.dto';

class MktSessionMultiProgramsDto {
  @Expose()
  title: string;

  @Expose()
  @Type(() => MktProgramDto)
  mktPrograms: MktProgramDto[];
}

class MktSessionMultiCampaignsDto {
  @Expose()
  title: string;

  @Expose()
  @Type(() => CampaignDto)
  campaigns: CampaignDto[];
}

class MktSessionSingleCampaignDto {
  @Expose()
  title: string;

  @Expose()
  @Type(() => CampaignDto)
  campaign: CampaignDto;
}

class MktSessionMultiPopularSearchesDto {
  @Expose()
  title: string;

  @Expose()
  @Type(() => PopularSearchDto)
  searches: PopularSearchDto[];
}

// --- 1. DTO EXPOSE CHO DETAIL HOME CONFIG ---
export class DetailHomeConfigResponseDto {
  @Expose()
  @Type(() => TopBannerDto)
  topBanner: TopBannerDto;

  @Expose()
  header: string;

  @Expose()
  @Type(() => MenuDto)
  menu: MenuDto[];

  @Expose()
  @Type(() => MainBannerDto)
  mainBanner: MainBannerDto[];

  @Expose()
  @Type(() => CategoryDto)
  listCategories: CategoryDto[];

  @Expose()
  historyProducts: string;

  @Expose()
  @Type(() => MktSessionMultiProgramsDto)
  marketingProgram01: MktSessionMultiProgramsDto;

  @Expose()
  @Type(() => MktSessionMultiCampaignsDto)
  marketingProgram02: MktSessionMultiCampaignsDto;

  @Expose()
  @Type(() => MktSessionMultiProgramsDto)
  marketingProgram03: MktSessionMultiProgramsDto;

  @Expose()
  suggestForYou: string;

  @Expose()
  @Type(() => MktSessionSingleCampaignDto)
  marketingProgram04: MktSessionSingleCampaignDto;

  @Expose()
  @Type(() => MktSessionSingleCampaignDto)
  marketingProgram05: MktSessionSingleCampaignDto;

  @Expose()
  @Type(() => MktSessionMultiCampaignsDto)
  marketingProgram06: MktSessionMultiCampaignsDto;

  @Expose()
  @Type(() => MktSessionMultiPopularSearchesDto)
  popularSearch: MktSessionMultiPopularSearchesDto;
}

// --- 2. DTO EXPOSE CHO CONFIG HOME ---
export class ConfigHomeResponseDto {
  @Expose()
  order: string[];

  @Expose()
  @Type(() => DetailHomeConfigResponseDto)
  config: DetailHomeConfigResponseDto;
}

// --- 3. DTO RESPONSE CHÍNH CHO STORE FRONT CONFIG ---
export class StoreFrontConfigDto extends SerializerDto {
  @Expose()
  @Type(() => ConfigHomeResponseDto)
  homeConfig: ConfigHomeResponseDto;
}
