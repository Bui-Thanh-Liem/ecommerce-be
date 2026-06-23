import { IBase } from '../../common/base.interface';
import { ICategory } from '../catalog/category.interface';

export interface IMenu extends IBase {
  name: string; // Tên của menu, ví dụ: "Máy giặc giá rẻ", "Phụ kiện điện tử giá rẻ"
  desc: string; // Mô tả của menu
  isActive: boolean; // Trạng thái hoạt động của menu, nếu false thì không hiển thị trên giao diện người dùng
  category: ICategory;
}
