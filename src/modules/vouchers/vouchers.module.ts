import { Module } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { VouchersController } from './vouchers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoucherEntity } from './entities/voucher.entity';
import { CustomersModule } from '../customers/customers.module';
import { ProductVariantsModule } from '../product-variants-SKU/product-variants.module';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [TypeOrmModule.forFeature([VoucherEntity]), CustomersModule, ProductVariantsModule, StoresModule],
  controllers: [VouchersController],
  providers: [VouchersService],
})
export class VouchersModule {}
