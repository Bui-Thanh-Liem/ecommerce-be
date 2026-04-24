import { ProductVariantSKUDto } from '@/modules/product-variants-SKU/dto/product-variant-SKU.dto';
import { StoreDto } from '@/modules/stores/dto/store.dto';
import { InventoryStockType } from '@/shared/enums/inventory-stock-type.enum';
import { Expose } from 'class-transformer';

export class InventoryDto {
  @Expose()
  id: string;

  @Expose()
  store: StoreDto;

  @Expose()
  productVariant: ProductVariantSKUDto;

  @Expose()
  quantity: number;

  @Expose()
  minStockLevel: number;

  @Expose()
  stockType: InventoryStockType;
}
