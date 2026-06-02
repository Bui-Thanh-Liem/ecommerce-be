import { ProductVariantSKUDto } from '@/modules/catalog/product-variants-SKU/dto/product-variant-SKU.dto';
import { ResponseImageDto } from '@/shared/dtos/res/response-image.dto';
import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { Expose, Type } from 'class-transformer';

export class CampaignDto extends SerializerDto {
  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  isActive: boolean;

  @Expose()
  desc: string;

  @Expose()
  @Type(() => ResponseImageDto)
  mainImage: ResponseImageDto;

  @Expose()
  @Type(() => ResponseImageDto)
  images: ResponseImageDto[];

  @Expose()
  @Type(() => ProductVariantSKUDto)
  productHighlighted: ProductVariantSKUDto[];

  @Expose()
  startDate: Date;

  @Expose()
  endDate: Date;
}
