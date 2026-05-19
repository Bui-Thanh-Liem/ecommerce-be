import { BrandDto } from '@/modules/brands/dto/brand.dto';
import { CategoryDto } from '@/modules/categories/dto/category.dto';
import { ProductImageDto } from '@/modules/product-images/dto/product-image.dto';
import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { Expose } from 'class-transformer';

export class ProductSPUDto extends SerializerDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  desc: string;

  @Expose()
  category: CategoryDto;

  @Expose()
  brand: BrandDto;

  @Expose()
  productImages: ProductImageDto[];

  @Expose()
  spu: string;

  @Expose()
  basePrice: number;

  @Expose()
  status: string;
}
