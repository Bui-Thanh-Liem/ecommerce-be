import { IBase } from '../base.interface';
import { IPhoneStore } from '../phone-store.interface';
import { IInventory } from './inventory.interface';
import { ILocationRegion } from './location-region.interface';
import { IProductItem } from './product-item.interface';
import { IStaff } from './staff.interface';

// (1 store / 1 warehouse)
export interface IStore extends IBase {
  locationRegion: ILocationRegion;
  name: string;
  address: string;
  phone: IPhoneStore[];
  staffs: IStaff[];
  openingHours: string; // Ví dụ: "8:00 AM - 10:00 PM"
  closingHours: string; // Ví dụ: "8:00 AM - 10:00 PM"
  lat: number; // Vĩ độ
  lng: number; // Kinh độ
  isActive: boolean; // Cửa hàng có đang hoạt động hay không

  // Quan hệ
  inventories?: IInventory[]; // Danh sách tồn kho của cửa hàng (nếu cần)
  productItems?: IProductItem[]; // Danh sách sản phẩm cụ thể (nếu cần)
}
