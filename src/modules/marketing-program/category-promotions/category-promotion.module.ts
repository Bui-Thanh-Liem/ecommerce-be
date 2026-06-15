import { forwardRef, Module } from '@nestjs/common';
import { CategoryPromotionService } from './category-promotion.service';
import { CategoryPromotionController } from './category-promotion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryPromotionEntity } from './entities/category-promotion.entity';
import { PromotionsModule } from '../promotions/promotions.module';
import { CategoriesModule } from '@/modules/catalog/categories/categories.module';
import { ProductVariantEntity } from '@/modules/catalog/product-variants-SKU/entities/product-variant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryPromotionEntity, ProductVariantEntity]),
    forwardRef(() => PromotionsModule),
    CategoriesModule,
  ],
  controllers: [CategoryPromotionController],
  providers: [CategoryPromotionService],
  exports: [CategoryPromotionService],
})
export class CategoryPromotionModule {}
