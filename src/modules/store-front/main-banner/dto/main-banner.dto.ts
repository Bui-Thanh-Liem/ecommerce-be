import { CampaignDto } from '@/modules/marketing-program/campaigns/dto/campaign.dto';
import { ResponseImageDto } from '@/shared/dtos/res/response-image.dto';
import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { Expose } from 'class-transformer';

export class MainBannerDto extends SerializerDto {
  @Expose()
  image: ResponseImageDto;

  @Expose()
  desc?: string;

  @Expose()
  isActive: boolean;

  @Expose()
  campaign: CampaignDto;

  @Expose()
  campaignSlug: string;
}
