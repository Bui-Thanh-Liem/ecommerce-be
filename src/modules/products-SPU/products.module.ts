import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { ProductCodeModule } from '../product-code/product-code.module';
import { CategoriesModule } from '../categories/categories.module';
import { BrandsModule } from '../brands/brands.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]), ProductCodeModule, CategoriesModule, BrandsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
