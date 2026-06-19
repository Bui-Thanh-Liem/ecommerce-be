import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { Expose } from 'class-transformer';

export class PopularSearchDto extends SerializerDto {
  @Expose()
  text: string;
}
