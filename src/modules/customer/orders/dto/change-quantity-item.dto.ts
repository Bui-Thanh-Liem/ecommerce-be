import { IsNumber, IsUUID } from 'class-validator';

export class ChangeQuantityDto {
  @IsUUID('4')
  orderId: string;

  @IsUUID('4')
  orderItemId: string;

  @IsUUID('4')
  productId: string;

  @IsNumber()
  quantity: number;

  @IsUUID('4')
  customerId: string;

  @IsUUID('4')
  storeId: string;
}
