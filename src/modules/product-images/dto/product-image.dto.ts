import { Expose } from 'class-transformer';

export class ProductImageDto {
  @Expose()
  id: string;

  @Expose()
  url: string;

  @Expose()
  isThumbnail: boolean;
}
