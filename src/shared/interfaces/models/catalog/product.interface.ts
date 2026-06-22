import { ProductStatus } from '@/shared/enums/product-status.enum';
import { IBase } from '../../common/base.interface';
import { ICategory } from './category.interface';
import { IBrand } from './brand.interface';
import { IProductVariant } from './product-variant.interface';
import { IProductImage } from './product-image.interface';
import { ICartItem } from '../customer/cart-item.interface';

export interface ISpecificationItem {
  key: string; // vd: "color", "storage"
  label: string; // vd: "Màu sắc", "Dung lượng"
  value: string;
  desc?: string; // Mô tả của thuộc tính (VD: "xanh da trời")
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
  desc: string;
  spu: string;
  model: string;
  basePrice: number;
  status: ProductStatus;
  discountPercent: number;
  category: ICategory;
  brand: IBrand;
  specifications: ISpecification[];

  // Media tối ưu
  thumbnail?: string; // Khi có productImages lấy tấm đầu tiên làm thumbnail
  videoUrl?: string;

  // Logistics mặc định cho SPU
  weight?: number; // gram
  length?: number; // cm
  width?: number; // cm
  height?: number; // cm

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;

  // Thống kê (Dùng để hiển thị nhanh không cần count/aggregate)
  ratingAvg: number;
  reviewCount: number;
  viewCount: number;
  soldCount: number;

  // Flags
  isFeatured: boolean; // Sản phẩm nổi bật (Banner, trang chủ, ...)
  allowReview: boolean;

  // ======================================
  cartItems?: ICartItem[];
  productVariants?: IProductVariant[];
  productImages?: IProductImage[];
}
