import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductVariantsService } from './product-variants.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { ProductVariantSKUDto } from './dto/product-variant-SKU.dto';
import { ProductVariantQueryDto } from './dto/query-product-variant-SKU.dto';
import { ProductVariantMetadataDto } from './dto/metadata-product-variant.dto';
import { Permissions } from '@/decorators/permission.decorator';
import { permissionsSeed } from '@/modules/management/permissions/seeding';

@Controller('product-variants')
@Serializer(ProductVariantSKUDto)
export class ProductVariantsController {
  constructor(private readonly productVariantsService: ProductVariantsService) {}

  @Post()
  @Permissions(permissionsSeed.productVariant.create.code)
  create(@Body() createProductVariantDto: CreateProductVariantDto) {
    return this.productVariantsService.create(createProductVariantDto);
  }

  @Get()
  @Permissions(permissionsSeed.productVariant.read.code)
  @Serializer(ProductVariantMetadataDto)
  findAll(@Query() query: ProductVariantQueryDto) {
    return this.productVariantsService.findAll(query);
  }

  @Get('options')
  @Permissions(permissionsSeed.productVariant.read.code)
  @Serializer(ProductVariantMetadataDto)
  async findOptions(@Query() query: ProductVariantQueryDto) {
    return await this.productVariantsService.findOptions(query);
  }

  @Get(':id')
  @Permissions(permissionsSeed.productVariant.read.code)
  findOne(@Param('id') id: string) {
    return this.productVariantsService.findOne(id);
  }

  @Patch(':id')
  @Permissions(permissionsSeed.productVariant.update.code)
  update(@Param('id') id: string, @Body() updateProductVariantDto: UpdateProductVariantDto) {
    return this.productVariantsService.update(id, updateProductVariantDto);
  }

  @Delete(':id')
  @Permissions(permissionsSeed.productVariant.delete.code)
  remove(@Param('id') id: string) {
    return this.productVariantsService.remove(id);
  }
}
