import { Controller, Get, Param, Query } from '@nestjs/common';
import { FiltersService } from './filters.service';
import { Public } from '@/decorators/public.decorator';
import { BrandQueryDto } from '../catalog/brands/dto/query-brand.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { BrandMetadataDto } from '../catalog/brands/dto/metadata-brand.dto';
import { CategoryMetadataDto } from '../catalog/categories/dto/metadata-category.dto';
import { CategoryQueryDto } from '../catalog/categories/dto/query-category.dto';

@Controller('filters')
export class FiltersController {
  constructor(private readonly filtersService: FiltersService) {}

  @Public()
  @Get('category/children/:categorySlug')
  @Serializer(CategoryMetadataDto)
  async findChildrenCategoryBySlug(@Param('categorySlug') categorySlug: string, @Query() query: CategoryQueryDto) {
    return await this.filtersService.findChildrenCategoryBySlug(categorySlug, query);
  }

  @Public()
  @Get('category/:categorySlug')
  @Serializer(BrandMetadataDto)
  async findBrandsByCategorySlug(@Param('categorySlug') categorySlug: string, @Query() query: BrandQueryDto) {
    return await this.filtersService.findBrandsByCategorySlug(categorySlug, query);
  }
}
