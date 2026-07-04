import { Module } from '@nestjs/common';
import { SepayService } from './sepay.service';
import { SepayController } from './sepay.controller';

@Module({
  controllers: [SepayController],
  providers: [SepayService],
})
export class SepayModule {}
