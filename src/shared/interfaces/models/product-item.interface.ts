import { ProductItemStatus } from '@/shared/enums/product-item-status.enum';
import { IBase } from '../base.interface';
import { IProductVariant } from './product-variant.interface';
import { IInventory } from './inventory.interface';
import { IOrder } from './order.interface';

export interface IProductItem extends IBase {
  productVariant: IProductVariant; // Thuộc về SKU nào
  inventory: IInventory; // Đang nằm ở kho/siêu thị cụ thể nào (Mối quan hệ N-1)

  serialNumber: string; // Số Serial/IMEI duy nhất của máy
  purchasePrice?: number; // Giá nhập đích danh của riêng con máy này
  importDate: Date; // Ngày nhập kho để tính tuổi hàng tồn (Ageing)

  status: ProductItemStatus; // TRONG_KHO, ĐÃ_BÁN, ĐANG_VẬN_CHUYỂN, LỖI_BẢO_HÀNH

  warrantyActivatedAt?: Date; // Ngày kích hoạt bảo hành điện tử của hãng
  order?: IOrder; // Nếu đã bán thì sẽ có thông tin đơn hàng liên quan
}
