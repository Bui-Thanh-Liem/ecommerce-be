import { forwardRef, Module } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { PromotionsController } from './promotions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionEntity } from './entities/promotion.entity';
import { CampaignModule } from '../campaigns/campaigns.module';
import { ProductVariantsModule } from '../../catalog/product-variants-SKU/product-variants.module';
import { ProductPromotionsModule } from '../product-promotions/product-promotions.module';
import { CategoryPromotionModule } from '../category-promotion/category-promotion.module';
import { StoresModule } from '@/modules/inventory/stores/stores.module';
import { LocationRegionsModule } from '@/modules/inventory/location-regions/location-regions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PromotionEntity]),
    forwardRef(() => CampaignModule),
    forwardRef(() => CategoryPromotionModule),
    forwardRef(() => ProductPromotionsModule),
    StoresModule,
    LocationRegionsModule,
    ProductVariantsModule,
  ],
  controllers: [PromotionsController],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
