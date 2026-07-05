import { Module } from '@nestjs/common';
import { SepayService } from './sepay.service';
import { SepayController } from './sepay.controller';
import { OrdersModule } from '@/modules/customer/orders/orders.module';

@Module({
  imports: [OrdersModule],
  controllers: [SepayController],
  providers: [SepayService],
})
export class SepayModule {}
