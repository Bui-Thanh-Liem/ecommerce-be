import { ResponseImageDto } from '@/shared/dtos/res/response-image.dto';
import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { Expose } from 'class-transformer';

export class BrandDto extends SerializerDto {
  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  code: string;

  @Expose()
  image: ResponseImageDto;

  @Expose()
  country: string;
}
