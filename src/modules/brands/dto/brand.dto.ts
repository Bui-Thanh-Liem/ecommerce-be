import { ResponseImageDto } from '@/shared/dtos/res/response-image.dto';
import { Expose, Type } from 'class-transformer';

export class BrandDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => ResponseImageDto)
  image: ResponseImageDto;

  @Expose()
  logo: ResponseImageDto;

  @Expose()
  country: string;
}
