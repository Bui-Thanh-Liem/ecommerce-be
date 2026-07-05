import { Global, Module } from '@nestjs/common';
import { OrderService } from './otp.service';

@Global()
@Module({
  providers: [OrderService],
  exports: [OrderService],
})
export class OtpModule {}
