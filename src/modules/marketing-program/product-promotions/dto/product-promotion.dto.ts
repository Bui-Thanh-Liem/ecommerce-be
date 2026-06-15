import { Expose, Type } from 'class-transformer';
import { PromotionDto } from '../../promotions/dto/promotion.dto';
import { ProductVariantSKUDto } from '@/modules/catalog/product-variants-SKU/dto/product-variant-SKU.dto';
import { SerializerDto } from '@/shared/dtos/res/serializer.dto';

export class ProductPromotionDto extends SerializerDto {
  @Expose()
  productVariant: ProductVariantSKUDto;

  @Expose()
  @Type(() => PromotionDto)
  promotion: PromotionDto;

  @Expose()
  customDiscount: number;

  @Expose()
  priority: number;

  @Expose()
  limitQuantity: number;

  @Expose()
  totalSoldQuantity: number;
}
