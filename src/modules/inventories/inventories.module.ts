import { Module } from '@nestjs/common';
import { InventoriesService } from './inventories.service';
import { InventoriesController } from './inventories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryEntity } from './entities/inventory.entity';
import { StoresModule } from '../stores/stores.module';
import { ProductVariantsModule } from '../product-variants-SKU/product-variants.module';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryEntity]), StoresModule, ProductVariantsModule],
  controllers: [InventoriesController],
  providers: [InventoriesService],
  exports: [InventoriesService],
})
export class InventoriesModule {}
