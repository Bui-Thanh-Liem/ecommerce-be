import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { ProductNavbarDto } from './dto/product-navbar.dto';
import { ProductNavbarQueryDto } from './dto/query-product-navbar.dto';
import { ProductNavbarMetadataDto } from './dto/metadata-product-navbar.dto';
import { CreateProductNavbarDto } from './dto/create-product-navbar.dto';
import { UpdateProductNavbarDto } from './dto/update-product-navbar.dto';
import { ProductNavbarService } from './product-navbar.service';
import { Public } from '@/decorators/public.decorator';
import { Permissions } from '@/decorators/permission.decorator';
import { permissionsSeed } from '@/modules/management/permissions/seeding';

@Controller('product-navbars')
@Serializer(ProductNavbarDto)
export class ProductNavbarController {
  constructor(private readonly navbarService: ProductNavbarService) {}

  @Post()
  @Permissions(permissionsSeed.productNavbar.create.code)
  create(@Body() createProductNavbarDto: CreateProductNavbarDto) {
    return this.navbarService.create(createProductNavbarDto);
  }

  @Get()
  @Permissions(permissionsSeed.productNavbar.read.code)
  @Serializer(ProductNavbarMetadataDto)
  findAll(@Query() query: ProductNavbarQueryDto) {
    return this.navbarService.findAll(query);
  }

  @Public()
  @Get('options')
  @Serializer(ProductNavbarMetadataDto)
  async findOptions(@Query() query: ProductNavbarQueryDto) {
    return await this.navbarService.findOptions(query);
  }

  @Get(':id')
  @Permissions(permissionsSeed.productNavbar.read.code)
  findOne(@Param('id') id: string) {
    return this.navbarService.findOne(id);
  }

  @Patch(':id')
  @Permissions(permissionsSeed.productNavbar.update.code)
  update(@Param('id') id: string, @Body() updateProductNavbarDto: UpdateProductNavbarDto) {
    return this.navbarService.update(id, updateProductNavbarDto);
  }

  @Delete(':id')
  @Permissions(permissionsSeed.productNavbar.delete.code)
  remove(@Param('id') id: string) {
    return this.navbarService.remove(id);
  }
}
