import { CategoryDto } from '@/modules/catalog/categories/dto/category.dto';
import { Expose } from 'class-transformer';
import { PromotionDto } from '../../promotions/dto/promotion.dto';
import { SerializerDto } from '@/shared/dtos/res/serializer.dto';

export class CategoryPromotionDto extends SerializerDto {
  @Expose()
  category: CategoryDto;

  @Expose()
  promotion: PromotionDto;

  @Expose()
  customDiscount: number;

  @Expose()
  priority: number;

  @Expose()
  limitQuantity: number;

  @Expose()
  totalSoldQuantity: number;
}
