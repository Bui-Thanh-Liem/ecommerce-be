import { PartialType } from '@nestjs/swagger';
import { CreateCategoryPromotionDto } from './create-category-promotion.dto';

export class UpdateCategoryPromotionDto extends PartialType(CreateCategoryPromotionDto) {}
