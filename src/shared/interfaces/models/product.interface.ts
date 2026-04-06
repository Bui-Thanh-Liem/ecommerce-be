import { IBase } from '../base.interface';
import { IInventory } from './inventory.interface';

export interface IProduct extends IBase {
  name: string;
  inventories?: IInventory[]; // Danh sách tồn kho của sản phẩm (nếu cần)
}
