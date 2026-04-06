import { LocationRegionType } from '@/shared/enums/location-region-type.enum';
import { IBase } from '../base.interface';

export interface ILocationRegion extends IBase {
  name: string;
  type: LocationRegionType;
  parent: ILocationRegion | null;
  children?: ILocationRegion[];
}
