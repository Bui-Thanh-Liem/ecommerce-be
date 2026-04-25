import { IBase } from '../base.interface';
import { ICart } from './cart.interface';
import { IProductVariant } from './product-variant.interface';
import { IProduct } from './product.interface';

export interface ICartItem extends IBase {
  cart: ICart;
  product: IProduct;
  productVariant: IProductVariant;
  quantity: number;
  price: number; // giá gốc
  discount: number; // số tiền giảm giá, có thể là 0 nếu không có giảm giá
  finalPrice: number; // giá sau khi áp dụng giảm giá, tính bằng price - discount
}
