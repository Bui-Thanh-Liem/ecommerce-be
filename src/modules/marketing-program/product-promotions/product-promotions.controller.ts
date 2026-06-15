import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductPromotionsService } from './product-promotions.service';
import { CreateProductPromotionDto } from './dto/create-product-promotion.dto';
import { UpdateProductPromotionDto } from './dto/update-product-promotion.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { ProductPromotionDto } from './dto/product-promotion.dto';
import { ProductPromotionMetadataDto } from './dto/metadata-product-promotion.dto';
import { ProductPromotionQueryDto } from './dto/query-product-promotion.dto';
import { Permissions } from '@/decorators/permission.decorator';
import { permissionsSeed } from '@/modules/management/permissions/seeding';
import { Public } from '@/decorators/public.decorator';

@Controller('product-promotions')
@Serializer(ProductPromotionDto)
export class ProductPromotionsController {
  constructor(private readonly productPromotionsService: ProductPromotionsService) {}

  @Post()
  @Permissions(permissionsSeed.promotionProduct.create.code)
  create(@Body() createProductPromotionDto: CreateProductPromotionDto) {
    return this.productPromotionsService.create(createProductPromotionDto);
  }

  @Get()
  @Permissions(permissionsSeed.promotionProduct.read.code)
  @Serializer(ProductPromotionMetadataDto)
  findAll(@Query() query: ProductPromotionQueryDto) {
    return this.productPromotionsService.findAll(query);
  }

  @Public()
  @Get('options')
  @Permissions(permissionsSeed.promotionProduct.read.code)
  @Serializer(ProductPromotionMetadataDto)
  findOptions(@Query() query: ProductPromotionQueryDto) {
    return this.productPromotionsService.findOptions(query);
  }

  @Get(':id')
  @Permissions(permissionsSeed.promotionProduct.read.code)
  findOne(@Param('id') id: string) {
    return this.productPromotionsService.findOne(id);
  }

  @Patch(':id')
  @Permissions(permissionsSeed.promotionProduct.update.code)
  update(@Param('id') id: string, @Body() updateProductPromotionDto: UpdateProductPromotionDto) {
    return this.productPromotionsService.update(id, updateProductPromotionDto);
  }

  @Delete(':id')
  @Permissions(permissionsSeed.promotionProduct.delete.code)
  remove(@Param('id') id: string) {
    return this.productPromotionsService.remove(id);
  }
}
