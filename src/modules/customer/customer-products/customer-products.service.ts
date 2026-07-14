import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerProductDto } from './dto/create-customer-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerProductEntity } from './entities/customer-product.entity';
import { Repository } from 'typeorm';
import { ProductVariantsService } from '../../catalog/product-variants-SKU/product-variants.service';
import { CustomersService } from '../customers/customers.service';
import { CustomerEntity } from '../customers/entities/customer.entity';
import { CustomerProductQueryDto } from './dto/query-customer-product.dto';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { IInfoGuest } from '@/shared/interfaces/common/info-guest';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { ProductImageEntity } from '@/modules/catalog/product-images/entities/product-image.entity';
import { CustomerProductType } from '@/shared/enums/customer-product-type.enum';

@Injectable()
export class CustomerProductsService {
  constructor(
    @InjectRepository(CustomerProductEntity)
    private customerProductRepository: Repository<CustomerProductEntity>,

    private readonly customersService: CustomersService,
    private readonly variantsService: ProductVariantsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create({
    dto,
    guest,
    customer,
  }: {
    guest?: IInfoGuest;
    customer?: CustomerEntity;
    dto: CreateCustomerProductDto;
  }) {
    const { productVariant: productVariantId, ...rest } = dto;

    // 1. Kiểm tra đã tồn tại chưa, nếu đã tồn tại thì không tạo mới nữa, tránh trùng lặp
    const obj = (customer && { customer: { id: customer.id } }) || { session: guest?.session };
    const exists = await this.customerProductRepository.exists({
      where: {
        ...obj,
        type: rest.type,
        productVariant: { id: productVariantId },
      },
    });
    if (exists) return true;

    // 2. Nếu có customer thì kiểm tra customer có tồn tại không, nếu không tồn tại thì trả về lỗi
    if (customer) {
      const customerExists = await this.customersService.exists([customer.id]);
      if (!customerExists) throw new NotFoundException('Customer does not exist');
    }

    // 3. Kiểm tra product variant có tồn tại không, nếu không tồn tại thì trả về lỗi
    const variantExists = await this.variantsService.exists([productVariantId]);
    if (!variantExists) throw new NotFoundException(`Product variant does not exist`);

    const customerProduct = this.customerProductRepository.create({
      ...rest,
      ...obj,
      productVariant: { id: productVariantId },
    });

    // 4. Nếu là type HISTORY thì tạo thêm các product variant SUGGEST dựa trên product variant HISTORY vừa tạo
    const suggestProducts = await this.variantsService.findVariantForSuggestById(productVariantId);
    if (suggestProducts.length > 0 && rest.type === CustomerProductType.HISTORY) {
      await Promise.all(
        suggestProducts.map((id) =>
          this.create({
            dto: {
              productVariant: id,
              type: CustomerProductType.SUGGEST,
            },
            customer,
            guest,
          }),
        ),
      );
    }

    // 5. Lưu vào database
    await this.customerProductRepository.save(customerProduct);

    return true;
  }

  async findAll({
    queries,
    customer,
    guest,
  }: {
    queries: CustomerProductQueryDto;
    customer: CustomerEntity;
    guest: IInfoGuest;
  }) {
    const { page, limit } = queries;
    const { take, skip } = calculatePagination(page, limit);

    const condition = (customer && { customer: { id: customer.id } }) || { session: guest?.session };
    return await this.customerProductRepository.find({
      where: { ...condition },
      relations: {
        customer: true,
        productVariant: {
          product: true,
        },
      },
      select: {
        id: true,
        type: true,
        createdAt: true,
        customer: {
          id: true,
          fullname: true,
        },
        productVariant: {
          id: true,
          sku: true,

          product: {
            id: true,
            name: true,
          },
        },
      },
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  async findOptions({
    type,
    guest,
    queries,
    customer,
  }: {
    type: string;
    guest: IInfoGuest;
    customer: CustomerEntity;
    queries: CustomerProductQueryDto;
  }) {
    const { page, limit } = queries;
    const { take, skip } = calculatePagination(page, limit);

    const condition = (customer && { customer: { id: customer.id } }) || { session: guest?.session };
    const [data, totalData] = await this.customerProductRepository.findAndCount({
      where: { ...condition, type: type as CustomerProductType },
      relations: {
        customer: true,
        productVariant: {
          product: {
            category: {
              parent: true,
            },
          },
        },
      },
      select: {
        id: true,
        type: true,
        createdAt: true,
        customer: {
          id: true,
          fullname: true,
        },
        productVariant: {
          id: true,
          sku: true,
          status: true,
          price: true,
          slug: true,
          discountPercent: true,
          salesAttributes: true,
          product: {
            id: true,
            name: true,
            slug: true,
            thumbnail: true,
            category: {
              id: true,
              name: true,
              slug: true,
              parent: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      order: { createdAt: 'DESC' },
      skip,
      take,
    });

    await this.sigUrl(data);

    return {
      data,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async remove({ id, customer, guest }: { id: string; customer: CustomerEntity; guest: IInfoGuest }) {
    //
    const condition = (customer && { customer: { id: customer.id } }) || { session: guest?.session };

    //
    const exists = await this.customerProductRepository.findOne({ where: { id, ...condition } });
    if (!exists) throw new NotFoundException('Customer product does not exist');

    //
    return await this.customerProductRepository.remove(exists);
  }

  async sigUrl(items: CustomerProductEntity[]): Promise<CustomerProductEntity[]> {
    return await Promise.all(
      items.map(async (item) => {
        const flattenedImages = item.productVariant?.productImages?.flat() || [];

        const updatedImages = flattenedImages.map(async (image) => {
          const imgData = image.image ? await this.cloudinaryService.generateImage(image.image) : image.image;

          return {
            ...image,
            image: {
              ...imgData,
            },
          } as ProductImageEntity;
        });

        item.productVariant.productImages = await Promise.all(updatedImages);

        return item;
      }),
    );
  }
}
