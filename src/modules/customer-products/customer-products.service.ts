import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerProductDto } from './dto/create-customer-product.dto';
import { UpdateCustomerProductDto } from './dto/update-customer-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerProductEntity } from './entities/customer-product.entity';
import { Not, Repository } from 'typeorm';
import { CustomersService } from '../customers/customers.service';
import { ProductVariantsService } from '../product-variants-SKU/product-variants.service';

@Injectable()
export class CustomerProductsService {
  constructor(
    @InjectRepository(CustomerProductEntity)
    private customerProductRepository: Repository<CustomerProductEntity>,

    private readonly customersService: CustomersService,
    private readonly variantsService: ProductVariantsService,
  ) {}

  async create(createCustomerProductDto: CreateCustomerProductDto) {
    const { customer: customerId, productVariant: productVariantId, ...rest } = createCustomerProductDto;

    //
    const exists = await this.customerProductRepository.findOne({
      where: {
        type: rest.type,
        customer: { id: customerId },
        productVariant: { id: productVariantId },
      },
    });
    if (exists) {
      throw new NotFoundException(
        // eslint-disable-next-line max-len
        `Customer product with customer ID ${customerId}, product variant ID ${productVariantId} and type ${rest.type} already exists`,
      );
    }

    //
    const customerExists = await this.customersService.exists([customerId]);
    if (!customerExists) {
      throw new NotFoundException(`Customer with ID ${customerId} does not exist`);
    }

    //
    const variantExists = await this.variantsService.exists([productVariantId]);
    if (!variantExists) {
      throw new NotFoundException(`Product variant with ID ${productVariantId} does not exist`);
    }

    const customerProduct = this.customerProductRepository.create({
      customer: { id: customerId },
      productVariant: { id: productVariantId },
      ...rest,
    });

    return await this.customerProductRepository.save(customerProduct);
  }

  async findAll() {
    return await this.customerProductRepository.find({ relations: ['customer', 'productVariant'] });
  }

  async findOne(id: string) {
    const customerProduct = await this.customerProductRepository.findOne({ where: { id } });
    if (!customerProduct) {
      throw new NotFoundException(`Customer product with ID ${id} does not exist`);
    }
    return customerProduct;
  }

  async update(id: string, updateCustomerProductDto: UpdateCustomerProductDto) {
    const { customer: customerId, productVariant: productVariantId, ...rest } = updateCustomerProductDto;

    //
    const exists = await this.customerProductRepository.findOne({
      where: {
        id: Not(id),
        type: rest.type,
        customer: { id: customerId },
        productVariant: { id: productVariantId },
      },
    });
    if (exists) {
      throw new NotFoundException(
        // eslint-disable-next-line max-len
        `Customer product with customer ID ${customerId}, product variant ID ${productVariantId} and type ${rest.type} already exists`,
      );
    }

    //
    if (customerId) {
      const customerExists = await this.customersService.exists([customerId]);
      if (!customerExists) {
        throw new NotFoundException(`Customer with ID ${customerId} does not exist`);
      }
    }

    //
    if (productVariantId) {
      const variantExists = await this.variantsService.exists([productVariantId]);
      if (!variantExists) {
        throw new NotFoundException(`Product variant with ID ${productVariantId} does not exist`);
      }
    }

    const customerProduct = await this.customerProductRepository.preload({
      id,
      customer: customerId ? { id: customerId } : undefined,
      productVariant: productVariantId ? { id: productVariantId } : undefined,
      ...rest,
    });
    if (!customerProduct) {
      throw new NotFoundException(`Customer product with ID ${id} does not exist`);
    }

    return await this.customerProductRepository.save(customerProduct);
  }

  async remove(id: string) {
    const customerProduct = await this.findOne(id);
    return await this.customerProductRepository.remove(customerProduct);
  }
}
