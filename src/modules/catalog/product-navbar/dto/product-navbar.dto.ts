import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { Expose } from 'class-transformer';

export class ProductNavbarDto extends SerializerDto {
  @Expose()
  name: string;

  @Expose()
  desc: string;

  @Expose()
  slug: string;

  @Expose()
  link: string;
}
