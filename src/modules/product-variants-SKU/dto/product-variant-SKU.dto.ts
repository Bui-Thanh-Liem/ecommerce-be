import { ProductSPUDto } from '@/modules/products-SPU/dto/product-SPU.dto';
import { ProductVariantCondition } from '@/shared/enums/product-variant-condition.enum';
import { ISpecification, ISpecificationItem } from '@/shared/interfaces/models/product-variant.interface';
import { Expose, Type } from 'class-transformer';

class SpecificationItemDto implements ISpecificationItem {
  @Expose()
  key: string;

  @Expose()
  value: string;

  @Expose()
  isHighlight?: boolean;

  @Expose()
  link?: string;

  @Expose()
  isSKU: boolean;

  @Expose()
  order: number;
}

class SpecificationDto implements ISpecification {
  @Expose()
  title: string;

  @Expose()
  @Type(() => SpecificationItemDto)
  items: SpecificationItemDto[];
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
  discountPrice: number;

  @Expose()
  conditions: ProductVariantCondition;

  @Expose()
  @Type(() => SpecificationDto)
  specifications: SpecificationDto[];
}
