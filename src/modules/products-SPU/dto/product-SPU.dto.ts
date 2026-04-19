import { BrandDto } from '@/modules/brands/dto/brand.dto';
import { CategoryDto } from '@/modules/categories/dto/category.dto';
import { SerializerDto } from '@/shared/dtos/serializer.dto';
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
  spu: string;

  @Expose()
  basePrice: number;

  @Expose()
  status: string;
}
