import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CustomerAddressService } from './customer-address.service';
import { CreateCustomerAddressDto } from './dto/create-customer-address.dto';
import { UpdateCustomerAddressDto } from './dto/update-customer-address.dto';
import { CustomerAddressQueryDto } from './dto/query-customer-address.dto';
import { Customer } from '@/decorators/customer.decorator';
import { CurrentCustomer } from '@/decorators/current-customer.decorator';
import { CustomerEntity } from '../customers/entities/customer.entity';

@Controller('customer-address')
export class CustomerAddressController {
  constructor(private readonly customerAddressService: CustomerAddressService) {}

  @Post()
  async create(@Body() createCustomerAddressDto: CreateCustomerAddressDto) {
    return await this.customerAddressService.create(createCustomerAddressDto);
  }

  @Get()
  async findAll(@Query() query: CustomerAddressQueryDto) {
    return await this.customerAddressService.findAll(query);
  }

  @Customer()
  @Get('owned')
  async findAllOwned(@Query() query: CustomerAddressQueryDto, @CurrentCustomer() customer: CustomerEntity) {
    return await this.customerAddressService.findAllOwned(customer.id, query);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCustomerAddressDto: UpdateCustomerAddressDto) {
    return await this.customerAddressService.update(id, updateCustomerAddressDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.customerAddressService.remove(id);
  }
}
