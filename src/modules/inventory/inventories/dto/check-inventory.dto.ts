import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CheckoutInventoryDto {
  @IsNumber()
  quantityOrdered: number;

  @IsUUID('4')
  variantId: string;

  /**
   * 0 kiểm tra cả hệ thống
   * 1 kiểm tra theo storeId
   * N kiểm tra theo nhiều storeId (1 khu vực có nhiều store)
   */
  @IsOptional()
  @IsUUID('4', { each: true })
  storeIds: string[];
}
