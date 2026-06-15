import { Serializer } from '@/interceptors/serializer.interceptor';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductSPUDto } from './dto/product-SPU.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { ProductQueryDto } from './dto/query-product.dto';
import { ProductMetadataDto } from './dto/metadata-product.dto';
import { Permissions } from '@/decorators/permission.decorator';
import { permissionsSeed } from '@/modules/management/permissions/seeding';
import { Public } from '@/decorators/public.decorator';

@Controller('products')
@Serializer(ProductSPUDto)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Permissions(permissionsSeed.product.create.code)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @Permissions(permissionsSeed.product.read.code)
  @Serializer(ProductMetadataDto)
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get('options')
  @Permissions(permissionsSeed.product.read.code)
  @Serializer(ProductMetadataDto)
  async findOptions(@Query() query: ProductQueryDto) {
    return await this.productsService.findOptions(query);
  }

  @Get(':id')
  @Permissions(permissionsSeed.product.read.code)
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Permissions(permissionsSeed.product.update.code)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Permissions(permissionsSeed.product.delete.code)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
