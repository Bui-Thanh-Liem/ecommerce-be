import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { In, Repository } from 'typeorm';
import { CustomersService } from '../customers/customers.service';
import { OrderItemEntity } from '../order-items/entities/order-item.entity';
import { OrderStatus } from '@/shared/enums/order-status.enum';
import { OrderQueryDto } from './dto/query-order.dto';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepo: Repository<OrderEntity>,
    private readonly customersService: CustomersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(customerId: string, dto: CreateOrderDto) {
    const { orderItems, ...rest } = dto;

    //
    const customerExists = await this.customersService.exists([customerId]);
    if (!customerExists) throw new NotFoundException('Customer not found');

    //
    const dataCreate = this.orderRepo.create({
      ...rest,
      customer: { id: customerId },
      orderItems: orderItems as unknown as OrderItemEntity[],
    });

    return await this.orderRepo.save(dataCreate);
  }

  async changeStatus(id: string, status: OrderStatus) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    order.status = status;
    return await this.orderRepo.save(order);
  }

  async findAllOwned(customerId: string, query: OrderQueryDto) {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    const builder = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('orderItem.product', 'variant')
      .leftJoinAndSelect('variant.product', 'product')

      //
      .select([
        'order.id',
        'order.totalAmount',
        'order.paymentGateway',
        'order.paymentMethod',
        'order.status',
        'order.invoiceNumber',
        'order.shoppingAddress',
        'order.createdAt',

        'customer.id',
        'customer.fullname',
        'customer.phone',

        'orderItem.id',
        'orderItem.price',
        'orderItem.quantity',

        'variant.id',
        'variant.sku',
        'variant.price',

        'product.id',
        'product.spu',
        'product.name',
        'product.thumbnail',
      ])
      .where('customer.id = :customerId', { customerId })
      .take(take)
      .skip(skip);

    const [data, totalData] = await builder.getManyAndCount();

    const dataWithSignedUrl = await this.signUrl(data);

    return {
      data: dataWithSignedUrl,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async exists(ids: string[]): Promise<boolean> {
    const count = await this.orderRepo.countBy({ id: In(ids) });
    return count === ids.length;
  }

  findAll() {
    return `This action returns all orders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, dto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  private async signUrl(data: OrderEntity[]): Promise<OrderEntity[]> {
    await Promise.all(
      data.map(async (order) => {
        await Promise.all(
          order.orderItems.map(async (item) => {
            const key = item.product.product.thumbnail?.key;

            if (key) {
              item.product.product.thumbnail.url = await this.cloudinaryService.generateUrl(key);
            }
          }),
        );
      }),
    );

    return data;
  }
}
