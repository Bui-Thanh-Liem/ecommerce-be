import { ResponseImageDto } from '@/shared/dtos/res/response-image.dto';
import { Expose } from 'class-transformer';

export class ProductImageDto {
  @Expose()
  id: string;

  @Expose()
  image: ResponseImageDto;

  @Expose()
  sortOrder: number;

  @Expose()
  isThumbnail: boolean;
}
