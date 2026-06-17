import { TokenType } from '../../enums/token-type.enum';

export interface IJwtPayload {
  type: TokenType;
  staffId?: string;
  customerId?: string;
  iat?: number; // Issued At Time (thời gian phát hành token)
  exp?: number; // Expiration Time (thời gian hết hạn token)
}
