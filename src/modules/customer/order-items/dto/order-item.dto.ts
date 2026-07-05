import { ProductVariantSKUDto } from '@/modules/catalog/product-variants-SKU/dto/product-variant-SKU.dto';
import { Expose } from 'class-transformer';

export class OrderItemDto {
  @Expose()
  price: number;

  @Expose()
  quantity: number;

  @Expose()
  product: ProductVariantSKUDto;
}
