import { Module } from '@nestjs/common';
import { ProductCodeService } from './product-code.service';

@Module({
  providers: [ProductCodeService],
  exports: [ProductCodeService],
})
export class ProductCodeModule {}
