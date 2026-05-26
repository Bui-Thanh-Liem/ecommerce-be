import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CartItemsService } from './cart-items.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart-items')
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Post()
  async addToCart(@Body() addToCartDto: AddToCartDto) {
    return await this.cartItemsService.addToCart(addToCartDto);
  }

  @Get()
  async findAll() {
    return await this.cartItemsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.cartItemsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCartItemDto: UpdateCartItemDto) {
    return await this.cartItemsService.update(id, updateCartItemDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.cartItemsService.remove(id);
  }
}
