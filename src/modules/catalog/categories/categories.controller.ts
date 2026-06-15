import { Permissions } from '@/decorators/permission.decorator';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { permissionsSeed } from '../../management/permissions/seeding';
import { CategoriesService } from './categories.service';
import { CategoryDto } from './dto/category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/query-category.dto';
import { CategoryMetadataDto } from './dto/metadata-category.dto';
import { Public } from '@/decorators/public.decorator';

@Controller('categories')
@Serializer(CategoryDto)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Permissions(permissionsSeed.category.create.code)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @Serializer(CategoryMetadataDto)
  @Permissions(permissionsSeed.category.read.code)
  async findAll(@Query() query: CategoryQueryDto) {
    return await this.categoriesService.findAll(query);
  }

  @Public()
  @Get('options')
  @Serializer(CategoryMetadataDto)
  @Permissions(permissionsSeed.category.read.code)
  async findOptions(@Query() query: CategoryQueryDto) {
    return await this.categoriesService.findOptions(query);
  }

  @Public()
  @Get('tree')
  @Permissions(permissionsSeed.category.read.code)
  async getTreeData(@Query() query: CategoryQueryDto) {
    return await this.categoriesService.getTreeData(query);
  }

  @Get(':id')
  @Permissions(permissionsSeed.category.read.code)
  async findOne(@Param('id') id: string) {
    return await this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @Permissions(permissionsSeed.category.update.code)
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return await this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Permissions(permissionsSeed.category.delete.code)
  async remove(@Param('id') id: string) {
    return await this.categoriesService.remove(id);
  }
}
