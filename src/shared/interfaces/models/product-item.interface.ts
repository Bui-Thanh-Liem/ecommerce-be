import { ProductItemStatus } from '@/shared/enums/product-item-status.enum';
import { IBase } from '../base.interface';
import { IProductVariant } from './product-variant.interface';
import { IInventory } from './inventory.interface';

export interface IProductItem extends IBase {
  productVariant: IProductVariant;
  inventory: IInventory; // Mỗi sản phẩm cụ thể sẽ có một tồn kho riêng (để theo dõi số lượng cụ thể của từng sản phẩm)
  serialNumber: string; // Số serial duy nhất cho mỗi sản phẩm (dùng để theo dõi từng sản phẩm cụ thể)
  status: ProductItemStatus; // Trạng thái của sản phẩm
}
