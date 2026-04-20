import { ProductVariantCondition } from '@/shared/enums/product-variant-condition.enum';
import { IBase } from '../base.interface';
import { IProduct } from './product.interface';
import { IInventory } from './inventory.interface';
import { IProductItem } from './product-item.interface';

export interface ISpecificationItem {
  key: string; // Thuộc tính, ví dụ: "Màu sắc"
  value: any; // Giá trị của thuộc tính, có thể là string, number, boolean, ...
  isHighlight?: boolean; // Có phải là thuộc tính nổi bật hay không (để hiển thị nổi bật trên UI)
  link?: string; // Nếu có, đây sẽ là URL liên kết đến trang chi tiết của thuộc tính này
  order: number; // Độ ưu tiên hiển thị (số càng nhỏ thì hiển thị càng trước)
  isSKU: boolean; // Để tạo mã SKU
}

export interface ISpecification {
  title: string; // Thông tin chi tiết
  items: ISpecificationItem[];
}

export interface IProductVariant extends IBase {
  product: IProduct;
  sku: string;
  price: number;
  discountPrice: number;
  soldCount: number;
  conditions: ProductVariantCondition;
  specifications: ISpecification[];

  //
  inventories?: IInventory[];
  productItems?: IProductItem[];
}
