import { ResponseImageDto } from '@/shared/dtos/res/response-image.dto';
import { Expose } from 'class-transformer';

export class BrandDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  code: string;

  @Expose()
  logo: ResponseImageDto;

  @Expose()
  country: string;
}
