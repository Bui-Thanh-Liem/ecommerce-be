import { forwardRef, Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreEntity } from './entities/store.entity';
import { LocationRegionsModule } from '../location-regions/location-regions.module';
import { StaffsModule } from '../staffs/staffs.module';

@Module({
  imports: [LocationRegionsModule, TypeOrmModule.forFeature([StoreEntity]), forwardRef(() => StaffsModule)],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}
