import { StaffTokenType } from '../enums/staff-token-type.enum';

export interface IJwtPayload {
  staffId: string;
  type: StaffTokenType;
}
