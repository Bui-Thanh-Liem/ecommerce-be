import { ProductImageDto } from '@/modules/product-images/dto/product-image.dto';
import { ProductSPUDto } from '@/modules/products-SPU/dto/product-SPU.dto';
import { ProductVariantCondition } from '@/shared/enums/product-variant-condition.enum';
import { Expose, Type } from 'class-transformer';

class SpecificationDto {
  @Expose()
  key: string;

  @Expose()
  label: string;

  @Expose()
  value: string;
}
export class ProductVariantSKUDto {
  @Expose()
  product: ProductSPUDto;

  @Expose()
  id: string;

  @Expose()
  sku: string;

  @Expose()
  price: number;

  @Expose()
  vat: number;

  @Expose()
  soldCount: number;

  @Expose()
  discountPercent: number;

  @Expose()
  conditions: ProductVariantCondition;

  @Expose()
  @Type(() => SpecificationDto)
  salesAttributes: SpecificationDto[];

  @Expose()
  @Type(() => ProductImageDto)
  productImages: ProductImageDto[];
}
