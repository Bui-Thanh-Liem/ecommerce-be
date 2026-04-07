import { Module } from '@nestjs/common';
import { ProductItemsService } from './product-items.service';
import { ProductItemsController } from './product-items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductItemEntity } from './entities/product-item.entity';
import { ProductVariantsModule } from '../product-variants-SKU/product-variants.module';
import { InventoriesModule } from '../inventories/inventories.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductItemEntity]), ProductVariantsModule, InventoriesModule],
  controllers: [ProductItemsController],
  providers: [ProductItemsService],
})
export class ProductItemsModule {}
