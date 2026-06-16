import { BaseMetadataDto } from '@/shared/dtos/res/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { TopBannerDto } from './top-banner.dto';

export class TopBannerMetadataDto extends BaseMetadataDto implements IMetadata<TopBannerDto> {
  @Expose()
  @Type(() => TopBannerDto)
  data: TopBannerDto[];
}
