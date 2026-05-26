import { ResponseImageDto } from '@/shared/dtos/res/response-image.dto';
import { Expose, Type } from 'class-transformer';

export class CampaignDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  isActive: boolean;

  @Expose()
  desc: string;

  @Expose()
  @Type(() => ResponseImageDto)
  mainImage: ResponseImageDto;

  @Expose()
  @Type(() => ResponseImageDto)
  images: ResponseImageDto[];

  @Expose()
  startDate: Date;

  @Expose()
  endDate: Date;
}
