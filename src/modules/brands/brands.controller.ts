import { Serializer } from '@/interceptors/serializer.interceptor';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandDto } from './dto/brand.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandQueryDto } from './dto/query-brand.dto';
import { BrandMetadataDto } from './dto/metadata-brand.dto';

@Controller('brands')
@Serializer(BrandDto)
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  async create(@Body() createBrandDto: CreateBrandDto) {
    return await this.brandsService.create(createBrandDto);
  }

  @Get()
  @Serializer(BrandMetadataDto)
  async findAll(@Query() query: BrandQueryDto) {
    return await this.brandsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.brandsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return await this.brandsService.update(id, updateBrandDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.brandsService.remove(id);
  }
}
