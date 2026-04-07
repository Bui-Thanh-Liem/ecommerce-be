import { InventoryStockType } from '@/shared/enums/inventory-stock-type.enum';
import { IBase } from '../base.interface';
import { IStore } from './store.interface';
import { IProductVariant } from './product-variant.interface';

export interface IInventory extends IBase {
  store: IStore; // Cửa hàng mà tồn kho này thuộc về (1 store / 1 warehouse)
  productVariant: IProductVariant;
  quantity: number;
  minStockLevel: number; // Số lượng tối thiểu để cảnh báo
  stockType: InventoryStockType;
}
