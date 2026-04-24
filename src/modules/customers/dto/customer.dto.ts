import { Expose } from 'class-transformer';

export class CustomerDto {
  @Expose()
  id: string;

  @Expose()
  fullname: string;

  @Expose()
  phone: string;

  @Expose()
  addresses: string[];
}
