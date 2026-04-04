import { LocationRegionType } from 'src/shared/enums/location-regions.enum';
import { IBase } from '../base.interface';

export interface ILocationRegion extends IBase {
  name: string;
  type: LocationRegionType;
  parent: ILocationRegion | null;
  children?: ILocationRegion[];
}
