import { IBase } from '../base.interface';
import { IPermission } from './permission.interface';
import { IStaff } from './staff.interface';

export interface IRole extends IBase {
  name: string; // tên vai trò, ví dụ: 'admin', 'editor', 'customer', v.v.
  desc: string; // mô tả vai trò
  // eslint-disable-next-line max-len
  permissions: IPermission[]; // danh sách mã quyền mà vai trò này có, giúp xác định những hành động mà người dùng thuộc vai trò này được phép thực hiện trong hệ thống.
  staffs?: IStaff[];
  isActive: boolean;
}
