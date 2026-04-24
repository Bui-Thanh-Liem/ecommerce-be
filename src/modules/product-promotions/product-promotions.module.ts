import { Module } from '@nestjs/common';
import { ProductPromotionsService } from './product-promotions.service';
import { ProductPromotionsController } from './product-promotions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPromotionEntity } from './entities/product-promotion.entity';
import { ProductVariantsModule } from '../product-variants-SKU/product-variants.module';
import { PromotionsModule } from '../promotions/promotions.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductPromotionEntity]), PromotionsModule, ProductVariantsModule],
  controllers: [ProductPromotionsController],
  providers: [ProductPromotionsService],
})
export class ProductPromotionsModule {}
