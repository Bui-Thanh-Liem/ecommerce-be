import { InventoryStockType } from '@/shared/enums/inventory-stock-type.enum';
import { IsEnum, IsInt, IsUUID } from 'class-validator';

export class CreateInventoryDto {
  @IsUUID('4')
  store: string; // warehouse

  @IsUUID('4')
  product: string;

  @IsInt()
  quantity: number;

  @IsInt()
  minStockLevel: number;

  @IsEnum(InventoryStockType, { message: 'stockType must be a valid InventoryStockType' })
  stockType: InventoryStockType;
}
