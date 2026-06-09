import { ResponseImageDto } from '@/shared/dtos/res/response-image.dto';
import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { Expose, Type } from 'class-transformer';

export class CategoryDto extends SerializerDto {
  @Expose()
  name: string;

  @Expose()
  code: string;

  @Expose()
  slug: string;

  @Expose()
  image: ResponseImageDto;

  @Expose()
  minPrice: number;

  @Expose()
  desc?: string;

  @Expose()
  @Type(() => CategoryDto)
  parent?: CategoryDto | null;

  @Expose()
  @Type(() => CategoryDto)
  children?: CategoryDto[] | null;
}
