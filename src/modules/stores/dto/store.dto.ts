import { SerializerDto } from '@/shared/dtos/serializer.dto';
import { Expose } from 'class-transformer';

export class StoreDto extends SerializerDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  address: string;

  @Expose()
  phone: string[];

  @Expose()
  openingHours: string;

  @Expose()
  closingHours: string;

  @Expose()
  lat: number;

  @Expose()
  lng: number;
}
