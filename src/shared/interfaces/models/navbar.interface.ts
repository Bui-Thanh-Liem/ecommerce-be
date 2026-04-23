import { IBase } from '../base.interface';

export interface INavbar extends IBase {
  name: string; // Tên của navbar, ví dụ: "Máy giặc giá rẻ", "Phụ kiện điện tử giá rẻ"
  slug: string; // Đường dẫn thân thiện với SEO, ví dụ: "may-giac-gia-re", "phu-kien-dien-tu-gia-re"
  link: string; // URL liên kết khi người dùng click vào navbar, có thể là đường dẫn nội bộ hoặc đường dẫn bên ngoài
}
