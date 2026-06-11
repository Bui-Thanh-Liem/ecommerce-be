import { Controller, Get, Post, Param, Delete, UseInterceptors } from '@nestjs/common';
import { CartsService } from './carts.service';
import { GuestInterceptor } from '@/interceptors/guest.interceptor';
import { GetInfoGuest } from '@/decorators/get-info-guest.decorator';
import { type IInfoGuest } from '@/shared/interfaces/common/info-guest';
import { Permissions } from '@/decorators/permission.decorator';
import { permissionsSeed } from '@/modules/management/permissions/seeding';
import { CurrentCustomer } from '@/decorators/current-customer.decorator';
import { CustomerEntity } from '../customers/entities/customer.entity';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  @UseInterceptors(GuestInterceptor)
  async create(@GetInfoGuest() guest: IInfoGuest, @CurrentCustomer() customer: CustomerEntity) {
    return await this.cartsService.create({ guest, customer });
  }

  @Get()
  @Permissions(permissionsSeed.cart.read.code)
  findAll() {
    return this.cartsService.findAll();
  }

  @Get(':id')
  @Permissions(permissionsSeed.cart.read.code)
  findOne(@Param('id') id: string) {
    return this.cartsService.findOne(id);
  }

  @Delete(':id')
  @UseInterceptors(GuestInterceptor)
  async remove(
    @Param('id') id: string,
    @GetInfoGuest() guest: IInfoGuest,
    @CurrentCustomer() customer: CustomerEntity,
  ) {
    return await this.cartsService.remove({ id, guest, customer });
  }
}
