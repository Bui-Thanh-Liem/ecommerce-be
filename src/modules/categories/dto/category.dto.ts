import { SerializerDto } from '@/shared/dtos/serializer.dto';
import { Expose, Type } from 'class-transformer';

export class CategoryDto extends SerializerDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  desc?: string | null;

  @Expose()
  @Type(() => CategoryDto)
  parent?: CategoryDto | null;

  @Expose()
  @Type(() => CategoryDto)
  children?: CategoryDto[] | null;
}
