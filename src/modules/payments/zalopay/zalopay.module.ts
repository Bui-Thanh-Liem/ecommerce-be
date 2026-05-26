import { Module } from '@nestjs/common';
import { ZaloPayService } from './zalopay.service';
import { ZaloPayController } from './zalopay.controller';

@Module({
  controllers: [ZaloPayController],
  providers: [ZaloPayService],
})
export class ZaloPayModule {}
