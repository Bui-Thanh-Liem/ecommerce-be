import { ProductVariantsService } from '@/modules/catalog/product-variants-SKU/product-variants.service';
import { InventoriesService } from '@/modules/inventory/inventories/inventories.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItemEntity } from './entities/order-item.entity';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItemEntity)
    private orderItemRepo: Repository<OrderItemEntity>,
    private readonly inventoriesService: InventoriesService,
    private readonly variantService: ProductVariantsService,
  ) {}

  // REFACTOR: Sẽ kiểm tra sâu hơn khi hoàn thành các chức năng cơ bản
  async checkout({ items }: CheckoutDto) {
    const [exists, available] = await Promise.all([
      this.variantService.exists(items.map((item) => item.productId)),
      Promise.all(
        items.map(async (item) => {
          return await this.inventoriesService.checkInventoryByStoreAndVariant(
            item.quantity,
            item.productId,
            item.,
          );
        }),
      ),
    ]);

    return [exists, available.every((item) => item === true)];
  }

  async changeQuantity(orderId: string, orderItemId: string, quantity: number, customerId: string) {
    const orderItem = await this.orderItemRepo.findOne({
      where: { id: orderItemId, order: { id: orderId, customer: { id: customerId } } },
    });
    if (!orderItem) throw new Error('Order item not found');

    if (quantity <= 0) {
      await this.orderItemRepo.remove(orderItem);
      return null;
    }

    orderItem.quantity = quantity;
    return await this.orderItemRepo.save(orderItem);
  }
}
