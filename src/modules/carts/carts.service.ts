import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CartEntity } from './entities/cart.entity';
import { DataSource, In, Repository } from 'typeorm';
import { CartItemsService } from '../cart-items/cart-items.service';
import { CustomersService } from '../customers/customers.service';
import { CartStatus } from '@/shared/enums/cart-status.enum';
import { CustomerEntity } from '../customers/entities/customer.entity';
import { CartItemEntity } from '../cart-items/entities/cart-item.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(CartEntity)
    private cartRepository: Repository<CartEntity>,

    private readonly customersService: CustomersService,

    @Inject(forwardRef(() => CartItemsService))
    private readonly cartItemsService: CartItemsService,
    private dataSource: DataSource,
  ) {}

  async create(createCartDto: CreateCartDto, sessionId?: string) {
    const { customer: customerId, ...cartData } = createCartDto;

    if (customerId) {
      const customer = await this.customersService.exists([customerId]);
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
    }

    const cart = this.cartRepository.create({
      ...cartData,
      customer: customerId ? { id: customerId } : undefined,
      session: sessionId,
    });
    return await this.cartRepository.save(cart);
  }

  async findAll() {
    return await this.cartRepository.find({ relations: ['customer', 'items'] });
  }

  async mergeCarts(guestSessionId: string, customerId: string) {
    return this.dataSource.transaction(async (manager) => {
      // 1. Lấy cart guest
      const guestCart = await manager.findOne(CartEntity, {
        where: { session: guestSessionId, status: CartStatus.ACTIVE },
        relations: ['cartItems'],
        lock: { mode: 'pessimistic_write' }, // Khóa bản ghi để tránh race condition
      });
      if (!guestCart) return;

      // 2. Lấy cart của customer
      const customerCart = await manager.findOne(CartEntity, {
        where: { customer: { id: customerId }, status: CartStatus.ACTIVE },
        relations: ['cartItems'],
        lock: { mode: 'pessimistic_write' }, // Khóa bản ghi để tránh race condition
      });

      // 3. Nếu user chưa có cart → convert luôn
      if (!customerCart) {
        guestCart.session = '';
        guestCart.customer = { id: customerId } as CustomerEntity;
        return await manager.save(guestCart);
      }

      // 4. Merge items
      const customerItemsMap = new Map(customerCart.cartItems?.map((item) => [item.productVariant.id, item]) || []);
      for (const guestItem of guestCart?.cartItems || []) {
        const existingItem = customerItemsMap.get(guestItem.productVariant.id);
        // Nếu customer đã có item này rồi thì cộng dồn quantity và price
        if (existingItem) {
          existingItem.quantity += guestItem.quantity;
          await manager.save(existingItem);
        } else {
          // Ngược lại thì chuyển cartItem sang cart của customer
          const newItem = manager.create(guestItem.constructor, {
            ...guestItem,
            id: customerCart.id,
            cart: customerCart,
          });
          await manager.save(newItem);
        }
      }

      // 5. Xoá guest cart + items
      await manager.delete(CartItemEntity, { cart_id: guestCart.id });
      await manager.delete(CartEntity, { id: guestCart.id });
    });
  }

  async findOne(id: string) {
    return await this.cartRepository.findOne({ where: { id }, relations: ['customer', 'items'] });
  }

  async exists(ids: string[]): Promise<boolean> {
    const count = await this.cartRepository.count({ where: { id: In(ids) } });
    return count === ids.length;
  }

  async update(id: string, updateCartDto: UpdateCartDto, sessionId?: string) {
    const { customer: customerId, ...cartData } = updateCartDto;

    if (customerId) {
      const customer = await this.customersService.exists([customerId]);
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
    }

    if (sessionId) {
      const cart = await this.cartRepository.findOne({ where: { id }, relations: ['customer'] });
      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      // Chỉ cho phép cập nhật nếu sessionId trùng hoặc cart đã có customer
      if (cart.session !== sessionId && !cart.customer) {
        throw new NotFoundException('Cart not found for this session');
      }
    }

    const cart = await this.cartRepository.preload({
      ...cartData,
      id: id ? id : undefined,
      session: sessionId ? sessionId : undefined,
      customer: customerId ? { id: customerId } : undefined,
    });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return await this.cartRepository.save(cart);
  }

  async remove(id: string, sessionId?: string) {
    if (!id && !sessionId) return null;

    if (id) {
      const cart = await this.findOne(id);
      if (!cart) {
        throw new NotFoundException('Cart not found');
      }
      return await this.cartRepository.remove(cart);
    } else {
      const cart = await this.cartRepository.findOne({ where: { session: sessionId } });
      if (!cart) {
        throw new NotFoundException('Cart not found for this session');
      }
      return await this.cartRepository.remove(cart);
    }
  }
}
