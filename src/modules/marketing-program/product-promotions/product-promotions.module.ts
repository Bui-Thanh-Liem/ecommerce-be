import { forwardRef, Module } from '@nestjs/common';
import { ProductPromotionsService } from './product-promotions.service';
import { ProductPromotionsController } from './product-promotions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPromotionEntity } from './entities/product-promotion.entity';
import { PromotionsModule } from '../promotions/promotions.module';
import { ProductVariantsModule } from '@/modules/catalog/product-variants-SKU/product-variants.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductPromotionEntity]),
    forwardRef(() => PromotionsModule),
    ProductVariantsModule,
  ],
  controllers: [ProductPromotionsController],
  providers: [ProductPromotionsService],
  exports: [ProductPromotionsService],
})
export class ProductPromotionsModule {}
