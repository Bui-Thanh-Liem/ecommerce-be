import { IJwtPayload } from './shared/interfaces/common/jwt-payload.interface';
import { ICustomer } from './shared/interfaces/models/customer/customer.interface';
import { IStaff } from './shared/interfaces/models/management/staff.interface';

declare global {
  namespace Express {
    interface Request {
      staff: IStaff | null;
      customer: ICustomer | null;
      targetStaff: IStaff | null; // Staff đang được thao tác (update, delete) trong route handler
      cookies?: {
        token?: string | null;
      };
      payload?: IJwtPayload;
    }
  }
}
