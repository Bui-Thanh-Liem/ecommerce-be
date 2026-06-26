import { Module } from '@nestjs/common';
import { MainBannerService } from './main-banner.service';
import { MainBannerController } from './main-banner.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MainBannerEntity } from './entities/main-banner.entity';
import { CampaignModule } from '@/modules/marketing-program/campaigns/campaigns.module';

@Module({
  imports: [TypeOrmModule.forFeature([MainBannerEntity]), CampaignModule],
  controllers: [MainBannerController],
  providers: [MainBannerService],
})
export class MainBannerModule {}
