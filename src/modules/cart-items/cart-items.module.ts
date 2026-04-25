import { forwardRef, Module } from '@nestjs/common';
import { CartItemsService } from './cart-items.service';
import { CartItemsController } from './cart-items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItemEntity } from './entities/cart-item.entity';
import { CartsModule } from '../carts/carts.module';
import { ProductsModule } from '../products-SPU/products.module';
import { ProductVariantsModule } from '../product-variants-SKU/product-variants.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartItemEntity]),
    forwardRef(() => CartsModule),
    ProductsModule,
    ProductVariantsModule,
  ],
  controllers: [CartItemsController],
  providers: [CartItemsService],
  exports: [CartItemsService],
})
export class CartItemsModule {}
