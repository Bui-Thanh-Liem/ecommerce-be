import { ProductVariantsService } from '@/modules/catalog/product-variants-SKU/product-variants.service';
import { InventoriesService } from '@/modules/inventory/inventories/inventories.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItemEntity } from './entities/order-item.entity';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItemEntity)
    private orderItemRepo: Repository<OrderItemEntity>,
    private readonly inventoriesService: InventoriesService,
    private readonly variantService: ProductVariantsService,
  ) {}

  // REFACTOR: Sẽ kiểm tra sâu hơn khi hoàn thành các chức năng cơ bản
  async checkout(variantIds: string[]) {
    const [exists, available] = await Promise.all([
      this.variantService.exists(variantIds),
      Promise.all(
        variantIds.map(async (id) => {
          return await this.inventoriesService.checkInventoryByStoreAndVariant(id);
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
