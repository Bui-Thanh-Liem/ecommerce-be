import 'multer';
import { IStaff } from './shared/interfaces/models/staff.interface';

declare global {
  namespace Express {
    interface Request {
      staff: IStaff | null;
      targetStaff: IStaff | null; // Staff đang được thao tác (update, delete) trong route handler
      cookies?: {
        token?: string | null;
      };
    }
  }
}
