import { Module } from '@nestjs/common';
import { ProductVariantsService } from './product-variants.service';
import { ProductVariantsController } from './product-variants.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariantEntity } from './entities/product-variant.entity';
import { ProductsModule } from '../products-SPU/products.module';
import { ProductCodeModule } from '../product-code/product-code.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductVariantEntity]), ProductsModule, ProductCodeModule],
  controllers: [ProductVariantsController],
  providers: [ProductVariantsService],
})
export class ProductVariantsModule {}
