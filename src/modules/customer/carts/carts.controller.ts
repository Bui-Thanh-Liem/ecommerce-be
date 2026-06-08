import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { GuestInterceptor } from '@/interceptors/guest.interceptor';
import { GetInfoGuest } from '@/decorators/get-info-guest.decorator';
import { type IInfoGuest } from '@/shared/interfaces/common/info-guest';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  @UseInterceptors(GuestInterceptor)
  async create(@GetInfoGuest() infoGuest: IInfoGuest, @Body() createCartDto: CreateCartDto) {
    return await this.cartsService.create(createCartDto, infoGuest.session);
  }

  @Get()
  findAll() {
    return this.cartsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(GuestInterceptor)
  async update(@GetInfoGuest() infoGuest: IInfoGuest, @Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return await this.cartsService.update(id, updateCartDto, infoGuest.session);
  }

  @Delete(':id')
  @UseInterceptors(GuestInterceptor)
  async remove(@GetInfoGuest() infoGuest: IInfoGuest, @Param('id') id: string) {
    return await this.cartsService.remove(id);
  }
}
