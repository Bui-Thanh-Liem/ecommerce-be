import { DETAIL_HOME_CONFIG_KEYS } from '@/shared/constants/home-config-keys.constant';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsObject, IsString, ValidateNested, IsIn, IsOptional } from 'class-validator';

// --- 1. Định nghĩa các Sub-Class tương ứng với các object lồng nhau trong IDetailHomeConfig ---
class MktSessionProgramDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  mktPrograms: Record<string, any>[];
}

class MktSessionSingleCampaignDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsObject()
  campaign: Record<string, any>;
}

class MktSessionMultiCampaignsDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  campaigns: Record<string, any>[];
}

class TopicDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @IsString({ each: true })
  topics: string[];
}

// --- 2. Class map trực tiếp với interface IDetailHomeConfig ---
export class DetailHomeConfigDto {
  @IsObject()
  @IsOptional()
  topBanner: Record<string, any>;

  @IsString()
  header: string;

  @IsArray()
  menu: Record<string, any>[];

  @IsArray()
  mainBanner: Record<string, any>[];

  @IsArray()
  listCategories: Record<string, any>[];

  @IsArray()
  historyProducts: Record<string, any>[];

  @IsObject()
  @ValidateNested()
  @Type(() => MktSessionProgramDto)
  mktSessionOne: MktSessionProgramDto;

  @IsObject()
  @ValidateNested()
  @Type(() => MktSessionProgramDto)
  mktSessionTwo: MktSessionProgramDto; // Giữ nguyên typo "Tow" theo code của bạn

  @IsArray()
  suggestForYou: Record<string, any>[];

  @IsObject()
  @ValidateNested()
  @Type(() => MktSessionSingleCampaignDto)
  mktSessionThree: MktSessionSingleCampaignDto;

  @IsObject()
  @ValidateNested()
  @Type(() => MktSessionSingleCampaignDto)
  mktSessionFour: MktSessionSingleCampaignDto;

  @IsObject()
  @ValidateNested()
  @Type(() => MktSessionMultiCampaignsDto)
  mktSessionFive: MktSessionMultiCampaignsDto;

  @IsObject()
  @ValidateNested()
  @Type(() => TopicDto)
  topic: TopicDto;
}

// --- 3. Class map trực tiếp với interface IConfigHome ---
export class ConfigHomeDto {
  @IsArray()
  @IsString({ each: true })
  // @IsIn kiểm tra đảm bảo mọi phần tử gửi lên trong mảng bắt buộc phải nằm trong tập hợp các key của DetailHomeConfig
  @IsIn(DETAIL_HOME_CONFIG_KEYS, {
    each: true,
    message: 'Mỗi phần tử trong order phải là một key hợp lệ của DetailHomeConfig',
  })
  order: (typeof DETAIL_HOME_CONFIG_KEYS)[number][];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DetailHomeConfigDto)
  config: DetailHomeConfigDto;
}

// --- 4. DTO CHÍNH EXPORT ĐƯỢC CHỈNH SỬA CHUẨN XÁC ---
export class CreateStoreFrontConfigDto {
  @IsObject()
  @ValidateNested()
  @Type(() => ConfigHomeDto)
  homeConfig: ConfigHomeDto;
}
