import { CategoryDto } from '@/modules/catalog/categories/dto/category.dto';
import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { Expose } from 'class-transformer';

export class MenuDto extends SerializerDto {
  @Expose()
  name: string;

  @Expose()
  category: CategoryDto;

  @Expose()
  categorySlug: string;

  @Expose()
  isActive: boolean;
}
