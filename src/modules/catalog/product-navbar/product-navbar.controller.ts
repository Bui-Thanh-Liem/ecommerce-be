import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { ProductNavbarDto } from './dto/product-navbar.dto';
import { ProductNavbarQueryDto } from './dto/query-product-navbar.dto';
import { ProductNavbarMetadataDto } from './dto/metadata-product-navbar.dto';
import { CreateProductNavbarDto } from './dto/create-product-navbar.dto';
import { UpdateProductNavbarDto } from './dto/update-product-navbar.dto';
import { ProductNavbarService } from './product-navbar.service';

@Controller('product-navbars')
@Serializer(ProductNavbarDto)
export class ProductNavbarController {
  constructor(private readonly navbarService: ProductNavbarService) {}

  @Post()
  create(@Body() createProductNavbarDto: CreateProductNavbarDto) {
    return this.navbarService.create(createProductNavbarDto);
  }

  @Get()
  @Serializer(ProductNavbarMetadataDto)
  findAll(@Query() query: ProductNavbarQueryDto) {
    return this.navbarService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.navbarService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductNavbarDto: UpdateProductNavbarDto) {
    return this.navbarService.update(id, updateProductNavbarDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.navbarService.remove(id);
  }
}
