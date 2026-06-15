import { CategoryDto } from '@/modules/catalog/categories/dto/category.dto';
import { Expose, Type } from 'class-transformer';
import { PromotionDto } from '../../promotions/dto/promotion.dto';
import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { ProductVariantSKUDto } from '@/modules/catalog/product-variants-SKU/dto/product-variant-SKU.dto';

export class CategoryPromotionDto extends SerializerDto {
  @Expose()
  category: CategoryDto;

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

  @Expose()
  @Type(() => ProductVariantSKUDto)
  productVariant: ProductVariantSKUDto[];
}
