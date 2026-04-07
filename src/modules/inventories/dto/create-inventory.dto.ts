import { InventoryStockType } from '@/shared/enums/inventory-stock-type.enum';
import { IsEnum, IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class CreateInventoryDto {
  @IsUUID('4')
  @IsNotEmpty()
  store: string; // warehouse

  @IsUUID('4')
  @IsNotEmpty()
  productVariant: string;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsInt()
  @Min(0)
  minStockLevel: number;

  @IsEnum(InventoryStockType, { message: 'stockType must be a valid InventoryStockType' })
  stockType: InventoryStockType;
}
