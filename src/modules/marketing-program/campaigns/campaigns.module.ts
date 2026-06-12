import { forwardRef, Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignEntity } from './entities/campaign.entity';
import { PromotionsModule } from '../promotions/promotions.module';
import { ProductVariantsModule } from '@/modules/catalog/product-variants-SKU/product-variants.module';

@Module({
  imports: [TypeOrmModule.forFeature([CampaignEntity]), forwardRef(() => PromotionsModule), ProductVariantsModule],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignModule {}
