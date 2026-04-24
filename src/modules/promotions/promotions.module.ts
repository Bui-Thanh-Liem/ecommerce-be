import { Module } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { PromotionsController } from './promotions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionEntity } from './entities/promotion.entity';
import { CampaignModule } from '../campaigns/campaigns.module';
import { ProductVariantsModule } from '../product-variants-SKU/product-variants.module';

@Module({
  imports: [TypeOrmModule.forFeature([PromotionEntity]), CampaignModule, ProductVariantsModule],
  controllers: [PromotionsController],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
