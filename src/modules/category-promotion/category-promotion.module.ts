import { Module } from '@nestjs/common';
import { CategoryPromotionService } from './category-promotion.service';
import { CategoryPromotionController } from './category-promotion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryPromotionEntity } from './entities/category-promotion.entity';
import { PromotionsModule } from '../promotions/promotions.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryPromotionEntity]), PromotionsModule, CategoriesModule],
  controllers: [CategoryPromotionController],
  providers: [CategoryPromotionService],
})
export class CategoryPromotionModule {}
