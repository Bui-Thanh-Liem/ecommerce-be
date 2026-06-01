import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CategoryPromotionService } from './category-promotion.service';
import { CreateCategoryPromotionDto } from './dto/create-category-promotion.dto';
import { UpdateCategoryPromotionDto } from './dto/update-category-promotion.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { CategoryPromotionDto } from './dto/category-promotion.dto';
import { CategoryPromotionQueryDto } from './dto/query-category-promotion.dto';
import { CategoryPromotionMetadataDto } from './dto/metadata-category-promotion.dto';

@Serializer(CategoryPromotionDto)
@Controller('category-promotion')
export class CategoryPromotionController {
  constructor(private readonly categoryPromotionService: CategoryPromotionService) {}

  @Post()
  create(@Body() createCategoryPromotionDto: CreateCategoryPromotionDto) {
    return this.categoryPromotionService.create(createCategoryPromotionDto);
  }

  @Get()
  @Serializer(CategoryPromotionMetadataDto)
  findAll(@Query() query: CategoryPromotionQueryDto) {
    return this.categoryPromotionService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryPromotionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryPromotionDto: UpdateCategoryPromotionDto) {
    return this.categoryPromotionService.update(id, updateCategoryPromotionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryPromotionService.remove(id);
  }
}
