import { Serializer } from '@/interceptors/serializer.interceptor';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandDto } from './dto/brand.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandQueryDto } from './dto/query-brand.dto';
import { BrandMetadataDto } from './dto/metadata-brand.dto';
import { permissionsSeed } from '@/modules/management/permissions/seeding';
import { Permissions } from '@/decorators/permission.decorator';

@Controller('brands')
@Serializer(BrandDto)
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @Permissions(permissionsSeed.brand.create.code)
  async create(@Body() createBrandDto: CreateBrandDto) {
    return await this.brandsService.create(createBrandDto);
  }

  @Get()
  @Permissions(permissionsSeed.brand.read.code)
  @Serializer(BrandMetadataDto)
  async findAll(@Query() query: BrandQueryDto) {
    return await this.brandsService.findAll(query);
  }

  @Get('options')
  @Permissions(permissionsSeed.brand.read.code)
  @Serializer(BrandMetadataDto)
  async findOptions(@Query() query: BrandQueryDto) {
    return await this.brandsService.findOptions(query);
  }

  @Get(':id')
  @Permissions(permissionsSeed.brand.read.code)
  async findOne(@Param('id') id: string) {
    return await this.brandsService.findOne(id);
  }

  @Patch(':id')
  @Permissions(permissionsSeed.brand.update.code)
  async update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return await this.brandsService.update(id, updateBrandDto);
  }

  @Delete(':id')
  @Permissions(permissionsSeed.brand.delete.code)
  async remove(@Param('id') id: string) {
    return await this.brandsService.remove(id);
  }
}
