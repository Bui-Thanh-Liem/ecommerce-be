import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { CustomerDto } from '../../customers/dto/customer.dto';
import { Expose, Transform } from 'class-transformer';
import { CustomerProductType } from '@/shared/enums/customer-product-type.enum';
import { ProductVariantSKUDto } from '@/modules/catalog/product-variants-SKU/dto/product-variant-SKU.dto';

export class CustomerProductDto extends SerializerDto {
  @Expose()
  @Transform(() => CustomerDto)
  customer: CustomerDto;

  @Expose()
  @Transform(() => ProductVariantSKUDto)
  productVariant: ProductVariantSKUDto;

  @Expose()
  type: CustomerProductType;
}
