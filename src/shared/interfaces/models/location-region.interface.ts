import { LocationRegionType } from '@/shared/enums/location-region-type.enum';
import { IBase } from '../base.interface';
import { IPromotion } from './promotion.interface';

export interface ILocationRegion extends IBase {
  name: string;
  type: LocationRegionType;
  parent: ILocationRegion | null;
  children?: ILocationRegion[];

  //
  promotions?: IPromotion[]; // Danh sách khuyến mãi áp dụng cho địa điểm này (nếu cần)
}
