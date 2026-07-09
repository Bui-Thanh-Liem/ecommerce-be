import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CustomerAddressService } from './customer-address.service';
import { CreateCustomerAddressDto } from './dto/create-customer-address.dto';
import { UpdateCustomerAddressDto } from './dto/update-customer-address.dto';
import { CustomerAddressQueryDto } from './dto/query-customer-address.dto';
import { Customer } from '@/decorators/customer.decorator';
import { CurrentCustomer } from '@/decorators/current-customer.decorator';
import { CustomerEntity } from '../customers/entities/customer.entity';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { CustomerAddressDto } from './dto/customer-address.dto';
import { CustomerAddressMetadataDto } from './dto/metadata-customer-address.dto';

@Controller('customer-address')
@Serializer(CustomerAddressDto)
export class CustomerAddressController {
  constructor(private readonly customerAddressService: CustomerAddressService) {}

  @Get()
  @Serializer(CustomerAddressMetadataDto)
  async findAll(@Query() query: CustomerAddressQueryDto) {
    return await this.customerAddressService.findAll(query);
  }

  @Customer()
  @Get('default')
  async findOneIsDefault(@CurrentCustomer() customer: CustomerEntity) {
    return await this.customerAddressService.findOneIsDefault(customer.id);
  }

  @Customer()
  @Post()
  async create(
    @CurrentCustomer() customer: CustomerEntity,
    @Body() createCustomerAddressDto: CreateCustomerAddressDto,
  ) {
    return await this.customerAddressService.create(customer.id, createCustomerAddressDto);
  }

  @Customer()
  @Get('owned')
  @Serializer(CustomerAddressMetadataDto)
  async findAllOwned(@Query() query: CustomerAddressQueryDto, @CurrentCustomer() customer: CustomerEntity) {
    return await this.customerAddressService.findAllOwned(customer.id, query);
  }

  @Customer()
  @Patch('/owned/:id')
  async update(
    @Param('id') id: string,
    @CurrentCustomer() customer: CustomerEntity,
    @Body() updateCustomerAddressDto: UpdateCustomerAddressDto,
  ) {
    return await this.customerAddressService.updateOwned(id, customer.id, updateCustomerAddressDto);
  }

  @Customer()
  @Delete('/owned/:id')
  async remove(@CurrentCustomer() customer: CustomerEntity, @Param('id') id: string) {
    return await this.customerAddressService.removeOwned(id, customer.id);
  }
}
