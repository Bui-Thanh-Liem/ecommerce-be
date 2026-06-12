import { BrandDto } from '@/modules/catalog/brands/dto/brand.dto';
import { CategoryDto } from '@/modules/catalog/categories/dto/category.dto';
import { ProductImageDto } from '@/modules/catalog/product-images/dto/product-image.dto';
import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { ISpecification, ISpecificationItem } from '@/shared/interfaces/models/catalog/product.interface';
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

export class ProductSPUDto extends SerializerDto {
  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  model: string;

  @Expose()
  thumbnail: string;

  @Expose()
  desc: string;

  @Expose()
  weight: number;

  @Expose()
  length: number;

  @Expose()
  width: number;

  @Expose()
  height: number;

  @Expose()
  isFeatured: boolean;

  @Expose()
  allowReview: boolean;

  @Expose()
  category: CategoryDto;

  @Expose()
  brand: BrandDto;

  @Expose()
  @Type(() => ProductImageDto)
  productImages: ProductImageDto[];

  @Expose()
  @Type(() => SpecificationDto)
  specifications: SpecificationDto[];

  @Expose()
  spu: string;

  @Expose()
  basePrice: number;

  @Expose()
  discountPercent: number;

  @Expose()
  status: string;
}
