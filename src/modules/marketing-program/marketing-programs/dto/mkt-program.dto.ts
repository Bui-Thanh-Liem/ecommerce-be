import { ResponseImageDto } from '@/shared/dtos/res/response-image.dto';
import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { Expose, Type } from 'class-transformer';
import { CampaignDto } from '../../campaigns/dto/campaign.dto';
import { MarketingProgramStatus } from '@/shared/enums/marketing-program-status.enum';

export class MktProgramDto extends SerializerDto {
  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  desc: string;

  @Expose()
  @Type(() => ResponseImageDto)
  mainImage: ResponseImageDto;

  @Expose()
  status: MarketingProgramStatus;

  @Expose()
  budget: number;

  @Expose()
  spentBudget: number;

  @Expose()
  totalOrders: number;

  @Expose()
  totalRevenue: number;

  @Expose()
  @Type(() => CampaignDto)
  campaigns: CampaignDto[];

  @Expose()
  startDate: Date;

  @Expose()
  endDate: Date;
}
