import { Expose, Type } from 'class-transformer';
import { CustomerDto } from './customer.dto';

export class CustomerVerifiedDto {
  @Expose()
  @Type(() => CustomerDto)
  customer: CustomerDto;

  @Expose()
  token: string;
}
