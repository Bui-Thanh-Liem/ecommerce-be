import { DETAIL_HOME_CONFIG_KEYS } from '@/shared/constants/home-config-keys.constant';
import { ImageDto } from '@/shared/dtos/req/image.dto';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
  IsIn,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

// --- 1. HỢP PHẦN CƠ BẢN (BASE COMPONENTS) ---
class MktProgramDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @ValidateNested()
  @Type(() => ImageDto)
  mainImage: ImageDto;
}

class CampaignDto extends MktProgramDto {}

class TopBannerItemDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ImageDto)
  image: ImageDto;
}

class MainBannerItemDto extends TopBannerItemDto {}

class MenuItemDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  link: string;
}

class PopularSearchItemDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}

class CategoryItemDto extends TopBannerItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  minPrice: number;
}

class PopularSearchDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PopularSearchItemDto)
  searches: PopularSearchItemDto[];
}

// --- 2. CÁC SUB-CLASS ĐÃ ĐƯỢC ĐỒNG BỘ THEO INTERFACE ---

// Dùng cho marketingProgram01 và marketingProgram03
class MktSessionProgramDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MktProgramDto)
  mktPrograms: MktProgramDto[];
}

// Dùng cho marketingProgram02 (Đã sửa từ map trực tiếp thành object chứa mảng campaign)
class MktSessionProgram02Dto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CampaignDto)
  campaigns: CampaignDto[];
}

// Dùng cho marketingProgram04 và marketingProgram05 (Đã sửa từ Record sang CampaignDto)
class MktSessionSingleCampaignDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsObject()
  @ValidateNested()
  @Type(() => CampaignDto)
  campaign: CampaignDto;
}

// Dùng cho marketingProgram06 (Đã sửa từ Record[] sang CampaignDto[])
class MktSessionMultiCampaignsDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CampaignDto)
  campaigns: CampaignDto[];
}

// --- 3. CLASS MAP TRỰC TIẾP VỚI INTERFACE IDetailHomeConfig ---
export class DetailHomeConfigDto {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TopBannerItemDto)
  topBanner: TopBannerItemDto;

  @IsOptional()
  @IsString()
  header: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemDto)
  menu: MenuItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MainBannerItemDto)
  mainBanner: MainBannerItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryItemDto)
  listCategories: CategoryItemDto[];

  @IsOptional()
  @IsString() // Giữ nguyên dạng string như interface
  historyProducts: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MktSessionProgramDto)
  marketingProgram01: MktSessionProgramDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MktSessionProgram02Dto) // SỬA ĐỔI: Dùng đúng sub-class bọc mảng thay vì map thẳng
  marketingProgram02: MktSessionProgram02Dto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MktSessionProgramDto)
  marketingProgram03: MktSessionProgramDto;

  @IsOptional()
  @IsString() // SỬA ĐỔI: Chuyển từ Record[] thành IsString theo đúng `suggestForYou: string` ở Interface
  suggestForYou: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MktSessionSingleCampaignDto)
  marketingProgram04: MktSessionSingleCampaignDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MktSessionSingleCampaignDto)
  marketingProgram05: MktSessionSingleCampaignDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MktSessionMultiCampaignsDto)
  marketingProgram06: MktSessionMultiCampaignsDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PopularSearchDto)
  popularSearch: PopularSearchDto;
}

// --- 4. CLASS MAP TRỰC TIẾP VỚI INTERFACE IConfigHome ---
export class ConfigHomeDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(DETAIL_HOME_CONFIG_KEYS, {
    each: true,
    message: 'Each element in the order must be a valid DetailHomeConfig key.',
  })
  order: (typeof DETAIL_HOME_CONFIG_KEYS)[number][];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DetailHomeConfigDto)
  config: DetailHomeConfigDto;
}

// --- 5. DTO CHÍNH ---
export class CreateStoreFrontConfigDto {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ConfigHomeDto)
  homeConfig: ConfigHomeDto;
}
