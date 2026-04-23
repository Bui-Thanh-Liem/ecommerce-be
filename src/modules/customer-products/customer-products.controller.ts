import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CustomerProductsService } from './customer-products.service';
import { CreateCustomerProductDto } from './dto/create-customer-product.dto';
import { UpdateCustomerProductDto } from './dto/update-customer-product.dto';

@Controller('customer-products')
export class CustomerProductsController {
  constructor(private readonly customerProductsService: CustomerProductsService) {}

  @Post()
  create(@Body() createCustomerProductDto: CreateCustomerProductDto) {
    return this.customerProductsService.create(createCustomerProductDto);
  }

  @Get()
  findAll() {
    return this.customerProductsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerProductsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomerProductDto: UpdateCustomerProductDto) {
    return this.customerProductsService.update(id, updateCustomerProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerProductsService.remove(id);
  }
}
