import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CartItemsService } from './cart-items.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Permissions } from '@/decorators/permission.decorator';
import { permissionsSeed } from '@/modules/management/permissions/seeding';

@Controller('cart-items')
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Post()
  async addToCart(@Body() addToCartDto: AddToCartDto) {
    return await this.cartItemsService.addToCart(addToCartDto);
  }

  @Get()
  @Permissions(permissionsSeed.cartItem.read.code)
  async findAll() {
    return await this.cartItemsService.findAll();
  }

  @Get(':id')
  @Permissions(permissionsSeed.cartItem.read.code)
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
