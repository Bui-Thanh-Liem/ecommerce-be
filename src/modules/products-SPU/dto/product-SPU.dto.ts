import { BrandDto } from '@/modules/brands/dto/brand.dto';
import { CategoryDto } from '@/modules/categories/dto/category.dto';
import { ProductImageDto } from '@/modules/product-images/dto/product-image.dto';
import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { ISpecification, ISpecificationItem } from '@/shared/interfaces/models/product.interface';
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
