import { TokenType } from '@/shared/enums/token-type.enum';
import { Expose } from 'class-transformer';
import { CustomerDto } from '../../customers/dto/customer.dto';

export class CustomerTokenDto {
  @Expose()
  token: string;

  @Expose()
  type: TokenType;

  @Expose()
  customer: CustomerDto;

  @Expose()
  expiresAt: Date;

  @Expose()
  isRevoked: boolean;

  @Expose()
  userAgent: string;

  @Expose()
  ipAddress: string;
}
