import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { CustomerProductsService } from './customer-products.service';
import { CreateCustomerProductDto } from './dto/create-customer-product.dto';
import { CurrentCustomer } from '@/decorators/current-customer.decorator';
import { CustomerEntity } from '../customers/entities/customer.entity';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { CustomerProductDto } from './dto/customer-product.dto';
import { CustomerProductMetadataDto } from './dto/metadata-customer-product.dto';
import { CustomerProductQueryDto } from './dto/query-customer-product.dto';
import { GetInfoGuest } from '@/decorators/get-info-guest.decorator';
import { type IInfoGuest } from '@/shared/interfaces/common/info-guest';
import { Public } from '@/decorators/public.decorator';

@Controller('customer-products')
@Serializer(CustomerProductDto)
export class CustomerProductsController {
  constructor(private readonly customerProductsService: CustomerProductsService) {}

  @Post()
  async create(
    @GetInfoGuest() guest: IInfoGuest,
    @Body() dto: CreateCustomerProductDto,
    @CurrentCustomer() customer: CustomerEntity,
  ) {
    return await this.customerProductsService.create({ dto, customer, guest });
  }

  @Get()
  @Serializer(CustomerProductMetadataDto)
  async findAll(
    @GetInfoGuest() guest: IInfoGuest,
    @Query() query: CustomerProductQueryDto,
    @CurrentCustomer() customer: CustomerEntity,
  ) {
    return await this.customerProductsService.findAll({ queries: query, customer, guest });
  }

  @Public()
  @Get('options')
  @Serializer(CustomerProductMetadataDto)
  async findOptions(
    @GetInfoGuest() guest: IInfoGuest,
    @Query() query: CustomerProductQueryDto,
    @CurrentCustomer() customer: CustomerEntity,
  ) {
    return await this.customerProductsService.findOptions({ queries: query, customer, guest });
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @GetInfoGuest() guest: IInfoGuest,
    @CurrentCustomer() customer: CustomerEntity,
  ) {
    return await this.customerProductsService.remove({ id, customer, guest });
  }
}
