import { ProductItemStatus } from '@/shared/enums/product-item-status.enum';
import { IBase } from '../base.interface';
import { IProductVariant } from './product-variant.interface';
import { IStore } from './store.interface';

export interface IProductItem extends IBase {
  productVariant: IProductVariant;
  store: IStore; // Cửa hàng mà sản phẩm này thuộc về (1 store / 1 warehouse)
  serialNumber: string; // Số serial duy nhất cho mỗi sản phẩm (dùng để theo dõi từng sản phẩm cụ thể)
  status: ProductItemStatus; // Trạng thái của sản phẩm
}
