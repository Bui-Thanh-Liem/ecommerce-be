import { Module } from '@nestjs/common';
import { TopBannersService } from './top-banners.service';
import { TopBannersController } from './top-banners.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopBannerEntity } from './entities/top-banner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TopBannerEntity])],
  controllers: [TopBannersController],
  providers: [TopBannersService],
  exports: [TopBannersService],
})
export class TopBannersModule {}
