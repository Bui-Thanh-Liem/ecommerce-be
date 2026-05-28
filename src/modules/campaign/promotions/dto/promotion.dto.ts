import { ResponseImageDto } from '@/shared/dtos/res/response-image.dto';
import { Expose, Type } from 'class-transformer';

export class PromotionDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  @Type(() => ResponseImageDto)
  image: ResponseImageDto;

  @Expose()
  country: string;
}
