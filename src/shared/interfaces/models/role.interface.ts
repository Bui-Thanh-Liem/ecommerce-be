import { IBase } from '../base.interface';
import { IPermission } from './permission.interface';
import { IStaff } from './staff.interface';
import { IStore } from './store.interface';

export interface IRole extends IBase {
  name: string; // tên vai trò, ví dụ: 'admin', 'editor', 'customer', v.v.
  desc: string; // mô tả vai trò
  // eslint-disable-next-line max-len
  code: number; // mã định danh duy nhất cho vai trò, thường được sử dụng trong hệ thống phân quyền để kiểm tra vai trò của người dùng.
  // eslint-disable-next-line max-len
  permissions: IPermission[]; // danh sách mã quyền mà vai trò này có, giúp xác định những hành động mà người dùng thuộc vai trò này được phép thực hiện trong hệ thống.
  // eslint-disable-next-line max-len
  stores?: IStore[]; // nếu vai trò này chỉ áp dụng cho một cửa hàng cụ thể, trường này sẽ chứa thông tin về cửa hàng đó. Nếu vai trò này áp dụng cho tất cả cửa hàng, trường này có thể để trống hoặc null.
  staffs?: IStaff[];
  isActive: boolean;
}
