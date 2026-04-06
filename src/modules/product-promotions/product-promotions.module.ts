import { Module } from '@nestjs/common';
import { ProductPromotionsService } from './product-promotions.service';
import { ProductPromotionsController } from './product-promotions.controller';

@Module({
  controllers: [ProductPromotionsController],
  providers: [ProductPromotionsService],
})
export class ProductPromotionsModule {}
