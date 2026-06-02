import { ResponseImageDto } from '@/shared/dtos/res/response-image.dto';
import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { Expose } from 'class-transformer';

export class ProductImageDto extends SerializerDto {
  @Expose()
  image: ResponseImageDto;

  @Expose()
  sortOrder: number;

  @Expose()
  isThumbnail: boolean;
}
