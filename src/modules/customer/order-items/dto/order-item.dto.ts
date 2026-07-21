import { ProductVariantSKUDto } from '@/modules/catalog/product-variants-SKU/dto/product-variant-SKU.dto';
import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { Expose } from 'class-transformer';

export class OrderItemDto extends SerializerDto {
  @Expose()
  price: number;

  @Expose()
  quantity: number;

  @Expose()
  product: ProductVariantSKUDto;
}
