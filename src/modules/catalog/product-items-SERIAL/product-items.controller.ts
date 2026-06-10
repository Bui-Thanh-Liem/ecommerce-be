import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductItemsService } from './product-items.service';
import { CreateProductItemDto } from './dto/create-product-item.dto';
import { UpdateProductItemDto } from './dto/update-product-item.dto';
import { ProductItemQueryDto } from './dto/query-product-item.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { ProductItemMetadataDto } from './dto/metadata-product-item.dto';
import { ProductItemSerialDto } from './dto/product-item-SERIAL.dto';
import { Permissions } from '@/decorators/permission.decorator';
import { permissionsSeed } from '@/modules/management/permissions/seeding';

@Controller('product-items')
@Serializer(ProductItemSerialDto)
export class ProductItemsController {
  constructor(private readonly productItemsService: ProductItemsService) {}

  @Post()
  @Permissions(permissionsSeed.productItem.create.code)
  create(@Body() createProductItemDto: CreateProductItemDto) {
    return this.productItemsService.create(createProductItemDto);
  }

  @Get()
  @Permissions(permissionsSeed.productItem.read.code)
  @Serializer(ProductItemMetadataDto)
  findAll(@Query() query: ProductItemQueryDto) {
    return this.productItemsService.findAll(query);
  }

  @Get(':id')
  @Permissions(permissionsSeed.productItem.read.code)
  findOne(@Param('id') id: string) {
    return this.productItemsService.findOne(id);
  }

  @Patch(':id')
  @Permissions(permissionsSeed.productItem.update.code)
  update(@Param('id') id: string, @Body() updateProductItemDto: UpdateProductItemDto) {
    return this.productItemsService.update(id, updateProductItemDto);
  }

  @Delete(':id')
  @Permissions(permissionsSeed.productItem.delete.code)
  remove(@Param('id') id: string) {
    return this.productItemsService.remove(id);
  }
}
