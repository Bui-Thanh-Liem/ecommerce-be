import { IBase } from '../base.interface';

export interface IOrderItem extends IBase {
  order: string;
  product: string;
  quantity: number;
  price: number;
}
