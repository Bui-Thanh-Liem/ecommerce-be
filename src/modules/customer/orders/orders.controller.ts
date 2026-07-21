import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Permissions } from '@/decorators/permission.decorator';
import { permissionsSeed } from '@/modules/management/permissions/seeding';
import { Customer } from '@/decorators/customer.decorator';
import { CurrentCustomer } from '@/decorators/current-customer.decorator';
import { CustomerEntity } from '../customers/entities/customer.entity';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { OrderDto } from './dto/order.dto';
import { OrderMetadataDto } from './dto/metadata-order.dto';
import { OrderQueryDto } from './dto/query-order.dto';

@Controller('orders')
@Serializer(OrderDto)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Customer()
  @Post()
  async create(@CurrentCustomer() customer: CustomerEntity, @Body() createOrderDto: CreateOrderDto) {
    return await this.ordersService.create(customer.id, createOrderDto);
  }

  @Customer()
  @Get('owned')
  @Serializer(OrderMetadataDto)
  findAllOwned(@CurrentCustomer() customer: CustomerEntity, @Query() query: OrderQueryDto) {
    return this.ordersService.findAllOwned(customer.id, query);
  }

  @Customer()
  @Get('owned/:id')
  async findOneOwned(@CurrentCustomer() customer: CustomerEntity, @Param('id') id: string) {
    return await this.ordersService.findOneOwned(customer.id, id);
  }

  @Get(':id')
  @Permissions(permissionsSeed.order.read.code)
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Customer()
  @Patch(':orderId/items/:orderItemId/product/:productId/quantity/:q')
  async changeQuantityItem(
    @CurrentCustomer() customer: CustomerEntity,
    @Param('orderId') orderId: string,
    @Param('orderItemId') orderItemId: string,
    @Param('productId') productId: string,
    @Param('q', new ParseIntPipe()) quantity: number,
  ) {
    return await this.ordersService.changeQuantityItem(orderId, orderItemId, productId, quantity, customer.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
