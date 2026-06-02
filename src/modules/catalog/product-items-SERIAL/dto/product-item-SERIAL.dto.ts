import { InventoryDto } from '@/modules/inventory/inventories/dto/inventory.dto';
import { ProductVariantSKUDto } from '@/modules/catalog/product-variants-SKU/dto/product-variant-SKU.dto';
import { ProductItemStatus } from '@/shared/enums/product-item-status.enum';
import { Expose } from 'class-transformer';
import { SerializerDto } from '@/shared/dtos/res/serializer.dto';

export class ProductItemSerialDto extends SerializerDto {
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
