import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductVariantsService } from './product-variants.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { ProductVariantSKUDto } from './dto/product-variant-SKU.dto';
import { ProductVariantQueryDto } from './dto/query-product-variant-SKU.dto';
import { ProductVariantMetadataDto } from './dto/metadata-product-variant.dto';

@Controller('product-variants')
@Serializer(ProductVariantSKUDto)
export class ProductVariantsController {
  constructor(private readonly productVariantsService: ProductVariantsService) {}

  @Post()
  create(@Body() createProductVariantDto: CreateProductVariantDto) {
    return this.productVariantsService.create(createProductVariantDto);
  }

  @Get()
  @Serializer(ProductVariantMetadataDto)
  findAll(@Query() query: ProductVariantQueryDto) {
    return this.productVariantsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productVariantsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductVariantDto: UpdateProductVariantDto) {
    return this.productVariantsService.update(id, updateProductVariantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productVariantsService.remove(id);
  }
}
