import { ResponseImageDto } from '@/shared/dtos/res/response-image.dto';
import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { Expose } from 'class-transformer';

export class MainBannerDto extends SerializerDto {
  @Expose()
  title: string;

  @Expose()
  slug: string;

  @Expose()
  image: ResponseImageDto;

  @Expose()
  desc?: string;

  @Expose()
  isActive: boolean;
}
