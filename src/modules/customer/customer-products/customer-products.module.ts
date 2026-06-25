import { forwardRef, Module } from '@nestjs/common';
import { CustomerProductsService } from './customer-products.service';
import { CustomerProductsController } from './customer-products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerProductEntity } from './entities/customer-product.entity';
import { ProductVariantsModule } from '../../catalog/product-variants-SKU/product-variants.module';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerProductEntity]),
    CustomersModule,
    forwardRef(() => ProductVariantsModule),
  ],
  controllers: [CustomerProductsController],
  providers: [CustomerProductsService],
  exports: [CustomerProductsService],
})
export class CustomerProductsModule {}
