import { IStaff } from './models/staff.interface';

export interface IBase {
  id: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  createdBy?: IStaff;
  updatedBy?: IStaff;
  handlerAfterInsert(): void;
  handlerAfterUpdate(): void;
  handlerAfterRemove(): void;
  logInsert(): void;
  logUpdate(): void;
  logRemove(): void;
}
