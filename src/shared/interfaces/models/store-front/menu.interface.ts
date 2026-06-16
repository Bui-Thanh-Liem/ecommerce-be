import { IBase } from '../../common/base.interface';

export interface IMenu extends IBase {
  name: string; // Tên của menu, ví dụ: "Máy giặc giá rẻ", "Phụ kiện điện tử giá rẻ"
  desc: string; // Mô tả của menu
  slug: string; // Đường dẫn thân thiện với SEO, ví dụ: "may-giac-gia-re", "phu-kien-dien-tu-gia-re"
  link: string; // URL liên kết khi người dùng click vào  menu, có thể là đường dẫn nội bộ hoặc đường dẫn bên ngoài
  isActive: boolean; // Trạng thái hoạt động của menu, nếu false thì không hiển thị trên giao diện người dùng
}
