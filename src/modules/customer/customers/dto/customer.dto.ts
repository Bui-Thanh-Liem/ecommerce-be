import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { Expose } from 'class-transformer';

export class CustomerDto extends SerializerDto {
  @Expose()
  fullname: string;

  @Expose()
  phone: string;

  @Expose()
  isActive: boolean;

  @Expose()
  email: string;

  @Expose()
  addresses: string[];

  //
  @Expose()
  message: string;
}
