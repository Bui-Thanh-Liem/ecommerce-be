import { Module } from '@nestjs/common';
import { LocationRegionsService } from './location-regions.service';
import { LocationRegionsController } from './location-regions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationRegionEntity } from './entities/location-region.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LocationRegionEntity])],
  controllers: [LocationRegionsController],
  providers: [LocationRegionsService],
  exports: [LocationRegionsService],
})
export class LocationRegionsModule {}
