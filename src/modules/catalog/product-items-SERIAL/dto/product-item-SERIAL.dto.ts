import { InventoryDto } from '@/modules/inventory/inventories/dto/inventory.dto';
import { ProductVariantSKUDto } from '@/modules/catalog/product-variants-SKU/dto/product-variant-SKU.dto';
import { ProductItemStatus } from '@/shared/enums/product-item-status.enum';
import { Expose } from 'class-transformer';

export class ProductItemSerialDto {
  @Expose()
  id: string;

  @Expose()
  productVariant: ProductVariantSKUDto;

  @Expose()
  inventory: InventoryDto;

  @Expose()
  purchasePrice: number;

  @Expose()
  locationInWarehouse: string;

  @Expose()
  serialNumber: string;

  @Expose()
  status: ProductItemStatus;
}
