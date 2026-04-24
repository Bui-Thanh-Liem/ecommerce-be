import { Module } from '@nestjs/common';
import { CustomerProductsService } from './customer-products.service';
import { CustomerProductsController } from './customer-products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerProductEntity } from './entities/customer-product.entity';
import { CustomersModule } from '../customers/customers.module';
import { ProductVariantsModule } from '../product-variants-SKU/product-variants.module';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerProductEntity]), CustomersModule, ProductVariantsModule],
  controllers: [CustomerProductsController],
  providers: [CustomerProductsService],
})
export class CustomerProductsModule {}
