import { Module } from '@nestjs/common';
import { MainBannerService } from './main-banner.service';
import { MainBannerController } from './main-banner.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MainBannerEntity } from './entities/main-banner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MainBannerEntity])],
  controllers: [MainBannerController],
  providers: [MainBannerService],
})
export class MainBannerModule {}
