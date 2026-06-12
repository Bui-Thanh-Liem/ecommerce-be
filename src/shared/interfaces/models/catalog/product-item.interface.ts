import { ProductItemStatus } from '@/shared/enums/product-item-status.enum';
import { IBase } from '../../common/base.interface';
import { IProductVariant } from './product-variant.interface';
import { IOrder } from '../customer/order.interface';
import { IInventory } from '../inventory/inventory.interface';

export interface IProductItem extends IBase {
  productVariant: IProductVariant; // Thuộc về SKU nào
  inventory: IInventory; // Đang nằm ở kho/siêu thị cụ thể nào (Mối quan hệ N-1)

  serialNumber: string; // Số Serial/IMEI duy nhất của máy
  purchasePrice?: number; // Giá nhập đích danh của riêng con máy này

  locationInWarehouse: string; // Vị trí cụ thể trong kho (kệ, hàng, vị trí) để dễ dàng tìm kiếm khi cần thiết
  status: ProductItemStatus; // TRONG_KHO, ĐÃ_BÁN, ĐANG_VẬN_CHUYỂN, LỖI_BẢO_HÀNH

  warrantyActivatedAt?: Date; // Ngày kích hoạt bảo hành điện tử của hãng

  // Nếu đã bán thì sẽ có thông tin đơn hàng liên quan
  order?: IOrder; // Nếu đã bán thì sẽ có thông tin đơn hàng liên quan
}
