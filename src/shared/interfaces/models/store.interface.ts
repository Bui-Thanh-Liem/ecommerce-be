import { IBase } from '../base.interface';
import { IPhoneStore } from '../phone-store.interface';
import { ILocationRegion } from './location-region.interface';

export interface IStore extends IBase {
  locationRegion: ILocationRegion;
  name: string;
  address: string;
  phone: IPhoneStore[];
  openingHours: string; // Ví dụ: "8:00 AM - 10:00 PM"
  closingHours: string; // Ví dụ: "8:00 AM - 10:00 PM"
  lat: number; // Vĩ độ
  lng: number; // Kinh độ
  isActive: boolean; // Cửa hàng có đang hoạt động hay không
}
