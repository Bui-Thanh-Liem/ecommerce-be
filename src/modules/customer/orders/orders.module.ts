import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { CustomersModule } from '../customers/customers.module';
import { OrderItemsModule } from '../order-items/order-items.module';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity]), CustomersModule, OrderItemsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
