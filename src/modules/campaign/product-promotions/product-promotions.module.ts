import { Module } from '@nestjs/common';
import { ProductPromotionsService } from './product-promotions.service';
import { ProductPromotionsController } from './product-promotions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPromotionEntity } from './entities/product-promotion.entity';
import { PromotionsModule } from '../promotions/promotions.module';
import { ProductVariantsModule } from '@/modules/catalog/product-variants-SKU/product-variants.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductPromotionEntity]), PromotionsModule, ProductVariantsModule],
  controllers: [ProductPromotionsController],
  providers: [ProductPromotionsService],
})
export class ProductPromotionsModule {}
