import { Module } from '@nestjs/common';
import { VnPayService } from './vnpay.service';
import { VnPayController } from './vnpay.controller';

@Module({
  controllers: [VnPayController],
  providers: [VnPayService],
})
export class VnPayModule {}
