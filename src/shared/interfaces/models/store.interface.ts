import { IBase } from '../base.interface';
import { IImage } from '../image.interface';
import { IPhoneStore } from '../phone-store.interface';
import { IInventory } from './inventory.interface';
import { ILocationRegion } from './location-region.interface';
import { IPromotion } from './promotion.interface';
import { IRole } from './role.interface';
import { IStaff } from './staff.interface';
import { IVoucher } from './voucher.interface';

// (1 store / 1 warehouse)
export interface IStore extends IBase {
  //
  country: ILocationRegion;
  provinceCity: ILocationRegion;
  districtTown: ILocationRegion;
  wardCommune: ILocationRegion;
  address: string;
  lat: number; // Vĩ độ
  lng: number; // Kinh độ

  //
  image?: IImage; // URL hình ảnh đại diện của cửa hàng
  name: string;
  phone: IPhoneStore[];
  openingHours: string; // Ví dụ: "8:00 AM - 10:00 PM"
  closingHours: string; // Ví dụ: "8:00 AM - 10:00 PM"
  isActive: boolean; // Cửa hàng có đang hoạt động hay không
  manager: IStaff; // Quản lý cửa hàng (có thể là một staff có vai trò quản lý)

  // Quan hệ
  staffs: IStaff[];
  roles?: IRole[]; // Các vai trò liên quan đến cửa hàng (nếu cần)
  inventories?: IInventory[]; // Danh sách tồn kho của cửa hàng (nếu cần)
  vouchers?: IVoucher[]; // Danh sách voucher áp dụng cho cửa hàng (nếu cần)
  promotions?: IPromotion[]; // Danh sách khuyến mãi áp dụng cho cửa hàng (nếu cần)
}
