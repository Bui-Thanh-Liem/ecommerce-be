import { IStaff } from './shared/interfaces/models/staff.interface';

declare global {
  namespace Express {
    interface Request {
      staff: IStaff | null;
      cookies?: {
        token?: string | null;
      };
    }
  }
}
