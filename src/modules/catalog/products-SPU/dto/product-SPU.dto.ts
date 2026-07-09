import { BrandDto } from '@/modules/catalog/brands/dto/brand.dto';
import { CategoryDto } from '@/modules/catalog/categories/dto/category.dto';
import { ProductImageDto } from '@/modules/catalog/product-images/dto/product-image.dto';
import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { ISpecification, ISpecificationItem } from '@/shared/interfaces/models/catalog/product.interface';
import { Expose, Type } from 'class-transformer';
import { ProductVariantSKUDto } from '../../product-variants-SKU/dto/product-variant-SKU.dto';
import { ImageDto } from '@/shared/dtos/req/image.dto';

export class SpecificationItemDto implements ISpecificationItem {
  @Expose()
  label: string;

  @Expose()
  desc: string;

  @Expose()
  key: string;

  @Expose()
  value: string;

  @Expose()
  isHighlight?: boolean;

  @Expose()
  link?: string;

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
  thumbnail: ImageDto;

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
  @Type(() => CategoryDto)
  secondaryCategories: CategoryDto[];

  @Expose()
  brand: BrandDto;

  @Expose()
  @Type(() => ProductImageDto)
  productImages: ProductImageDto[];

  @Expose()
  @Type(() => SpecificationDto)
  specifications: SpecificationDto[];

  @Expose()
  @Type(() => ProductVariantSKUDto)
  productVariants: ProductVariantSKUDto[];

  @Expose()
  spu: string;

  @Expose()
  basePrice: number;

  @Expose()
  discountPercent: number;

  @Expose()
  status: string;
}
