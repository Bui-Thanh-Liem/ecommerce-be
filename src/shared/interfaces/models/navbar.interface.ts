import { IBase } from '../common/base.interface';

export interface IProductNavbar extends IBase {
  name: string; // Tên của product navbar, ví dụ: "Máy giặc giá rẻ", "Phụ kiện điện tử giá rẻ"
  desc: string; // Mô tả của product navbar
  slug: string; // Đường dẫn thân thiện với SEO, ví dụ: "may-giac-gia-re", "phu-kien-dien-tu-gia-re"
  link: string; // URL liên kết khi người dùng click vào  navbar, có thể là đường dẫn nội bộ hoặc đường dẫn bên ngoài
}
