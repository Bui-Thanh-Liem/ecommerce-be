import { ProductVariantCondition } from '@/shared/enums/product-variant-condition.enum';
import { IBase } from '../base.interface';
import { IProduct } from './product.interface';
import { IInventory } from './inventory.interface';
import { IProductItem } from './product-item.interface';
import { IRating } from './rating.interface';
import { IProductPromotion } from './product-promotion.interface';
import { IPromotion } from './promotion.interface';
import { ICartItem } from './cart-item.interface';
import { IProductImage } from './product-image.interface';

/**
 * KHÔNG DÙNG BẢNG ATTRIBUTE TRUYỀN THỐNG:
 * - Sẽ trùng khi ip15 128GB và ip16 128GB tốn kém disk
 * - Nhưng Sử dụng postgres (JSONB) thì các thuật toán nén đã tối ưu rất tốt
 * - Đổi lại thì sẽ đơn giản code hơn, trong khi vẫn đảm bảo hiệu năng tốt (không join nhiều, vẫn có index)
 **/
export interface IVariantAttribute {
  key: string; // vd: "color", "storage"
  label: string; // vd: "Màu sắc", "Dung lượng"
  value: string; // vd: "Đen lục bảo", "128GB"
  isSKU?: boolean; // Thuộc tính nào sẽ hiển thị ở SKU
}

export interface IProductVariant extends IBase {
  product: IProduct;
  sku: string;
  barcode?: string; // Mã vạch quốc tế của hãng (EAN/UPC) trên vỏ hộp

  price: number; // Giá bán niêm yết
  costPrice: number; // Giá vốn (Giá nhập trung bình/gốc để tính lợi nhuận)
  discountPercent: number;
  vat?: number;
  soldCount: number;

  conditions: ProductVariantCondition; // Hàng mới, Hàng trưng bày (xả kho), Hàng đổi trả
  salesAttributes: IVariantAttribute[]; // JSONB lưu color, dung tích, công suất...
  productImages: IProductImage[];

  // ======================================
  inventories?: IInventory[];
  productItems?: IProductItem[];
  rating?: IRating[];
  productPromotions?: IProductPromotion[];
  promotions?: IPromotion[];
  cartItems?: ICartItem[];
}
