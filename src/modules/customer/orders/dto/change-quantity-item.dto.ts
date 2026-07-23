import { IsArray, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class ChangeQuantityDto {
  @IsOptional()
  @IsUUID('4')
  orderId: string;

  @IsOptional()
  @IsUUID('4')
  orderItemId: string;

  @IsUUID('4')
  productId: string;

  @IsNumber()
  quantity: number;

  @IsUUID('4')
  customerId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  storeIds: string[];
}
