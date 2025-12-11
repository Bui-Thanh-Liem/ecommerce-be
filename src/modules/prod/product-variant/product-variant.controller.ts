import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductVariantService } from './product-variant.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

@Controller('product-variant')
export class ProductVariantController {
  constructor(private readonly productVariantService: ProductVariantService) {}

  @Post()
  create(@Body() body: CreateProductVariantDto) {
    return this.productVariantService.create(body);
  }

  @Get()
  findAll() {
    return this.productVariantService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productVariantService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateProductVariantDto) {
    return this.productVariantService.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productVariantService.remove(+id);
  }
}
