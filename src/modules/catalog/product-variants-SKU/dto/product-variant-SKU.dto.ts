import { ProductImageDto } from '@/modules/catalog/product-images/dto/product-image.dto';
import { ProductSPUDto } from '@/modules/catalog/products-SPU/dto/product-SPU.dto';
import { ProductVariantCondition } from '@/shared/enums/product-variant-condition.enum';
import { Expose, Type } from 'class-transformer';

class SpecificationDto {
  @Expose()
  key: string;

  @Expose()
  label: string;

  @Expose()
  value: string;

  @Expose()
  isSKU: boolean;
}
export class ProductVariantSKUDto {
  @Expose()
  product: ProductSPUDto;

  @Expose()
  id: string;

  @Expose()
  sku: string;

  @Expose()
  barcode: string;

  @Expose()
  price: number;

  @Expose()
  costPrice: number;

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
