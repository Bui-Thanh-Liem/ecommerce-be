import { TokenType } from '@/shared/enums/token-type.enum';
import { IBase } from '../common/base.interface';
import { ICustomer } from './customer.interface';

export interface ICustomerToken extends IBase {
  customer: ICustomer;
  type: TokenType;
  token: string;
  expiresAt: Date; // thời gian hết hạn của token
  isRevoked: boolean;
  userAgent: string;
  ipAddress: string;
}
