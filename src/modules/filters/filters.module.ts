import { Module } from '@nestjs/common';
import { FiltersService } from './filters.service';
import { FiltersController } from './filters.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariantEntity } from '../catalog/product-variants-SKU/entities/product-variant.entity';
import { BrandEntity } from '../catalog/brands/entities/brand.entity';
import { CategoryEntity } from '../catalog/categories/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductVariantEntity, BrandEntity, CategoryEntity])],
  controllers: [FiltersController],
  providers: [FiltersService],
})
export class FiltersModule {}
