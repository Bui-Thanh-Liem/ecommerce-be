import { ProductStatus } from '@/shared/enums/product-status.enum';
import { IBase } from '../base.interface';
import { ICategory } from './category.interface';
import { IBrand } from './brand.interface';
import { IProductVariant } from './product-variant.interface';
import { ICartItem } from './cart-item.interface';
import { IProductImage } from './product-image.interface';

export interface ISpecificationItem {
  key: string; // Thuộc tính, ví dụ: "Màu sắc"
  value: any; // Giá trị của thuộc tính, có thể là string, number, boolean, ...
  isHighlight?: boolean; // Có phải là thuộc tính nổi bật hay không (để hiển thị nổi bật trên UI)
  order: number; // Độ ưu tiên hiển thị (số càng nhỏ thì hiển thị càng trước)
}

export interface ISpecification {
  title: string; // Tên nhóm thuộc tính, ví dụ: "Thông số kỹ thuật"
  items: ISpecificationItem[];
}

export interface IProduct extends IBase {
  name: string;
  slug: string;
  desc: string; // Mô tả sản phẩm
  spu: string;
  basePrice: number;
  discountPercent: number;
  status: ProductStatus;
  category: ICategory;
  brand: IBrand;
  specifications: ISpecification[]; // Các thông số kỹ thuật chung của sản phẩm

  //
  productVariants?: IProductVariant[];
  cartItems?: ICartItem[];
  productImages?: IProductImage[];
}
