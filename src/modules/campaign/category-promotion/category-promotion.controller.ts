import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CategoryPromotionService } from './category-promotion.service';
import { CreateCategoryPromotionDto } from './dto/create-category-promotion.dto';
import { UpdateCategoryPromotionDto } from './dto/update-category-promotion.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { CategoryPromotionDto } from './dto/category-promotion.dto';
import { CategoryPromotionQueryDto } from './dto/query-category-promotion.dto';
import { CategoryPromotionMetadataDto } from './dto/metadata-category-promotion.dto';
import { Permissions } from '@/decorators/permission.decorator';
import { permissionsSeed } from '@/modules/management/permissions/seeding';

@Serializer(CategoryPromotionDto)
@Controller('category-promotions')
export class CategoryPromotionController {
  constructor(private readonly categoryPromotionService: CategoryPromotionService) {}

  @Post()
  @Permissions(permissionsSeed.promotionCategory.create.code)
  create(@Body() createCategoryPromotionDto: CreateCategoryPromotionDto) {
    return this.categoryPromotionService.create(createCategoryPromotionDto);
  }

  @Get()
  @Permissions(permissionsSeed.promotionCategory.read.code)
  @Serializer(CategoryPromotionMetadataDto)
  findAll(@Query() query: CategoryPromotionQueryDto) {
    return this.categoryPromotionService.findAll(query);
  }

  @Get(':id')
  @Permissions(permissionsSeed.promotionCategory.read.code)
  findOne(@Param('id') id: string) {
    return this.categoryPromotionService.findOne(id);
  }

  @Patch(':id')
  @Permissions(permissionsSeed.promotionCategory.update.code)
  update(@Param('id') id: string, @Body() updateCategoryPromotionDto: UpdateCategoryPromotionDto) {
    return this.categoryPromotionService.update(id, updateCategoryPromotionDto);
  }

  @Delete(':id')
  @Permissions(permissionsSeed.promotionCategory.delete.code)
  remove(@Param('id') id: string) {
    return this.categoryPromotionService.remove(id);
  }
}
