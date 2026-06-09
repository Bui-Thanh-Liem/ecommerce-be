import { Module } from '@nestjs/common';
import { MainBannerService } from './main-banner.service';
import { MainBannerController } from './main-banner.controller';

@Module({
  controllers: [MainBannerController],
  providers: [MainBannerService],
})
export class MainBannerModule {}
