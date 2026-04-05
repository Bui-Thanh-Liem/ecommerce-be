import { StaffTokenType } from '../enums/staff-token-type.enum';

export interface IJwtPayload {
  userId: string;
  type: StaffTokenType;
}
