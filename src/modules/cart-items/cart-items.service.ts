import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItemEntity } from './entities/cart-item.entity';
import { Repository } from 'typeorm';
import { CartsService } from '../carts/carts.service';
import { ProductsService } from '../products-SPU/products.service';
import { ProductVariantsService } from '../product-variants-SKU/product-variants.service';

@Injectable()
export class CartItemsService {
  constructor(
    @InjectRepository(CartItemEntity)
    private cartItemRepository: Repository<CartItemEntity>,

    @Inject(forwardRef(() => CartsService))
    private readonly cartsService: CartsService,

    private readonly productsService: ProductsService,
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  async addToCart(addToCartDto: AddToCartDto) {
    const { cart: cartId, product: productId, productVariant: productVariantId, ...rest } = addToCartDto;

    // Kiểm tra tồn tại của cart, product và productVariant
    const cart = await this.cartsService.exists([cartId]);
    if (!cart) {
      throw new NotFoundException(`Cart with id ${cartId} not found`);
    }

    const product = await this.productsService.exists([productId]);
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    const productVariant = await this.productVariantsService.exists([productVariantId]);
    if (!productVariant) {
      throw new NotFoundException(`Product variant with id ${productVariantId} not found`);
    }

    // Tạo mới cart item
    const cartItem = this.cartItemRepository.create({
      cart: { id: cartId },
      product: { id: productId },
      productVariant: { id: productVariantId },
      ...rest,
    });

    return await this.cartItemRepository.save(cartItem);
  }

  async findAll() {
    return await this.cartItemRepository.find({ relations: ['cart', 'product', 'productVariant'] });
  }

  async findOne(id: string) {
    return await this.cartItemRepository.findOne({ where: { id }, relations: ['cart', 'product', 'productVariant'] });
  }

  async update(id: string, updateCartItemDto: UpdateCartItemDto) {
    const { cart: cartId, product: productId, productVariant: productVariantId, ...rest } = updateCartItemDto;

    // Kiểm tra tồn tại của cart, product và productVariant
    if (cartId) {
      const cart = await this.cartsService.exists([cartId]);
      if (!cart) {
        throw new NotFoundException(`Cart with id ${cartId} not found`);
      }
    }

    if (productId) {
      const product = await this.productsService.exists([productId]);
      if (!product) {
        throw new NotFoundException(`Product with id ${productId} not found`);
      }
    }

    if (productVariantId) {
      const productVariant = await this.productVariantsService.exists([productVariantId]);
      if (!productVariant) {
        throw new NotFoundException(`Product variant with id ${productVariantId} not found`);
      }
    }

    // Tạo mới cart item
    const cartItem = await this.cartItemRepository.preload({
      id,
      cart: cartId ? { id: cartId } : undefined,
      product: productId ? { id: productId } : undefined,
      productVariant: productVariantId ? { id: productVariantId } : undefined,
      ...rest,
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with id ${id} not found`);
    }

    return await this.cartItemRepository.save(cartItem);
  }

  async remove(id: string) {
    const cartItem = await this.findOne(id);
    if (!cartItem) {
      throw new NotFoundException(`Cart item with id ${id} not found`);
    }
    return await this.cartItemRepository.remove(cartItem);
  }
}
