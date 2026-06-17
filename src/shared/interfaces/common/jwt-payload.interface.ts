import { TokenType } from '../../enums/token-type.enum';

export interface IJwtPayload {
  type: TokenType;
  staffId?: string;
  customerId?: string;
  iat?: number;
  exp?: number;
}
