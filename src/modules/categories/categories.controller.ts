import { Permissions } from '@/decorators/permission.decorator';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { permissionsSeed } from '../permissions/seeding';
import { CategoriesService } from './categories.service';
import { CategoryDto } from './dto/category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
@Serializer(CategoryDto)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Permissions(permissionsSeed.category.create.name)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @Permissions(permissionsSeed.category.read.name)
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @Permissions(permissionsSeed.category.read.name)
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @Permissions(permissionsSeed.category.update.name)
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Permissions(permissionsSeed.category.delete.name)
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
