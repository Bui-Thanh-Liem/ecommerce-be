import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RatingEntity } from './entities/rating.entity';
import { CustomersService } from '../customers/customers.service';
import { ProductVariantsService } from '../product-variants-SKU/product-variants.service';
import { Repository } from 'typeorm';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(RatingEntity)
    private readonly ratingRepository: Repository<RatingEntity>,

    private readonly customersService: CustomersService,
    private readonly productVariantService: ProductVariantsService,
  ) {}

  async create(createRatingDto: CreateRatingDto) {
    const { customer: customerId, productVariant, ...rest } = createRatingDto;

    // Kiểm tra sự tồn tại của customer
    const customerExists = await this.customersService.exists([customerId]);
    if (!customerExists) {
      throw new NotFoundException(`Customer with ID ${customerId} does not exist`);
    }

    // Kiểm tra sự tồn tại của productVariant
    const productVariantExists = await this.productVariantService.exists([productVariant]);
    if (!productVariantExists) {
      throw new NotFoundException(`Product variant with ID ${productVariant} does not exist`);
    }

    // Tạo và lưu rating mới
    const rating = this.ratingRepository.create({
      ...rest,
      customer: { id: customerId },
      productVariant: { id: productVariant },
    });
    return await this.ratingRepository.save(rating);
  }

  async findAll() {
    return await this.ratingRepository.find();
  }

  async findOne(id: string) {
    return await this.ratingRepository.findOne({ where: { id } });
  }

  async update(id: string, updateRatingDto: UpdateRatingDto) {
    const { customer: customerId, productVariant, ...rest } = updateRatingDto;

    // Kiểm tra sự tồn tại của customer
    if (customerId) {
      const customerExists = await this.customersService.exists([customerId]);
      if (!customerExists) {
        throw new NotFoundException(`Customer with ID ${customerId} does not exist`);
      }
    }

    // Kiểm tra sự tồn tại của productVariant
    if (productVariant && productVariant.length > 0) {
      const productVariantExists = await this.productVariantService.exists([productVariant]);
      if (!productVariantExists) {
        throw new NotFoundException(`Product variant with ID ${productVariant} does not exist`);
      }
    }

    //
    const rating = await this.ratingRepository.preload({
      id,
      customer: customerId ? { id: customerId } : undefined,
      productVariant: productVariant ? { id: productVariant } : undefined,
      ...rest,
    });
    if (!rating) {
      throw new NotFoundException(`Rating with ID ${id} does not exist`);
    }
    return await this.ratingRepository.save(rating);
  }

  async remove(id: string) {
    const rating = await this.findOne(id);
    if (!rating) {
      throw new NotFoundException(`Rating with ID ${id} does not exist`);
    }

    return await this.ratingRepository.remove(rating);
  }
}
