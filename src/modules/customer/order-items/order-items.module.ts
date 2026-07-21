import { Module } from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemEntity } from './entities/order-item.entity';
import { InventoriesModule } from '@/modules/inventory/inventories/inventories.module';
import { ProductVariantsModule } from '@/modules/catalog/product-variants-SKU/product-variants.module';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItemEntity]), InventoriesModule, ProductVariantsModule],
  controllers: [],
  providers: [OrderItemsService],
  exports: [OrderItemsService],
})
export class OrderItemsModule {}
