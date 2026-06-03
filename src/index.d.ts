import 'multer';
import { IStaff } from './shared/interfaces/models/staff.interface';
import { ICustomer } from './shared/interfaces/models/customer.interface';

declare global {
  namespace Express {
    interface Request {
      staff: IStaff | null;
      customer: ICustomer | null;
      targetStaff: IStaff | null; // Staff đang được thao tác (update, delete) trong route handler
      cookies?: {
        token?: string | null;
      };
    }
  }
}
