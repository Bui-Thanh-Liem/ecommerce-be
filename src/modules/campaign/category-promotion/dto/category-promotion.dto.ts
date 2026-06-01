import { CategoryDto } from '@/modules/catalog/categories/dto/category.dto';
import { Expose } from 'class-transformer';
import { PromotionDto } from '../../promotions/dto/promotion.dto';

export class CategoryPromotionDto {
  @Expose()
  id: string;

  @Expose()
  category: CategoryDto;

  @Expose()
  promotion: PromotionDto;

  @Expose()
  customDiscount: number;

  @Expose()
  priority: number;
}
