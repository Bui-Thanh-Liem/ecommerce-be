import { IBase } from '../../common/base.interface';
import { IProductVariant } from '../catalog/product-variant.interface';
import { IProduct } from '../catalog/product.interface';
import { ICart } from './cart.interface';

export interface ICartItem extends IBase {
  cart: ICart;
  product: IProduct;
  productVariant: IProductVariant;
  quantity: number;
  price: number; // giá gốc
  discount: number; // số tiền giảm giá, có thể là 0 nếu không có giảm giá
  finalPrice: number; // giá sau khi áp dụng giảm giá, tính bằng price - discount
}
