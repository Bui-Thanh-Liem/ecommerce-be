import { IBase } from '../base.interface';
import { IRole } from './role.interface';

export interface IPermission extends IBase {
  name: string; // tên quyền, ví dụ: 'manage_users', 'view_reports', 'edit_products', v.v.
  desc: string; // mô tả quyền
  // eslint-disable-next-line max-len
  code: string; // mã định danh duy nhất cho quyền, thường được sử dụng trong hệ thống phân quyền để kiểm tra quyền của người dùng.
  isActive: boolean; // trạng thái hoạt động của quyền, giúp quản lý và kiểm soát quyền trong hệ thống.
  // eslint-disable-next-line max-len
  roles?: IRole[]; // danh sách mã vai trò mà quyền này thuộc về, giúp xác định những vai trò nào có quyền này trong hệ thống.
  keyGroup?: string; // key nhóm quyền, giúp phân loại và tổ chức các quyền trong hệ thống.
}
