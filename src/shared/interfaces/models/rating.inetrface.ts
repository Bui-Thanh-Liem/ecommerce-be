import { IBase } from '../base.interface';
import { ICustomer } from './customer.interface';
import { IProductVariant } from './product-variant.interface';

export interface IRating extends IBase {
  customer: ICustomer;
  productVariant: IProductVariant;
  rating: number; // Điểm đánh giá (ví dụ: từ 1 đến 5)
  comment?: string; // Bình luận của người dùng (nếu có)
  timeUsed?: Date; // Thời gian sử dụng sản phẩm (để đánh giá sau khi đã trải nghiệm)
  images?: string[]; // Mảng chứa URL của hình ảnh đánh giá (nếu có)
}
