import { StaffEntity } from './modules/staffs/entities/staff.entity';

declare global {
  namespace Express {
    interface Request {
      staff: StaffEntity | null;
      session?: {
        token?: string | null;
      };
    }
  }
}
