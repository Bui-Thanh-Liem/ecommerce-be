import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { GuestInterceptor } from '@/interceptors/guest.interceptor';
import { Guest } from '@/decorators/guest.decorator';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  @UseInterceptors(GuestInterceptor)
  async create(@Guest() sessionId: string, @Body() createCartDto: CreateCartDto) {
    return await this.cartsService.create(createCartDto, sessionId);
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
  async update(@Guest() sessionId: string, @Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return await this.cartsService.update(id, updateCartDto, sessionId);
  }

  @Delete(':id')
  @UseInterceptors(GuestInterceptor)
  async remove(@Guest() sessionId: string, @Param('id') id: string) {
    return await this.cartsService.remove(id);
  }
}
