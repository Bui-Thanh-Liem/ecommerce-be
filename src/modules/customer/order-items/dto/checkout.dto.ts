import { IsArray, IsNumber, IsUUID } from 'class-validator';

export class CheckoutDto {
  @IsUUID('4')
  productId: string;

  @IsNumber()
  quantityOrdered: number;

  @IsUUID('4')
  customerId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  storeIds: string[];
}
