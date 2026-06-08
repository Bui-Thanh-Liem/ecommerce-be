import { BaseMetadataDto } from '@/shared/dtos/res/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { CampaignDto } from './campaign.dto';

export class CampaignMetadataDto extends BaseMetadataDto implements IMetadata<CampaignDto> {
  @Expose()
  @Type(() => CampaignDto)
  data: CampaignDto[];
}
