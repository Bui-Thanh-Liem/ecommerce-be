import { BaseMetadataDto } from '@/shared/dtos/res/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { MainBannerDto } from './main-banner.dto';

export class MainBannerMetadataDto extends BaseMetadataDto implements IMetadata<MainBannerDto> {
  @Expose()
  @Type(() => MainBannerDto)
  data: MainBannerDto[];
}
