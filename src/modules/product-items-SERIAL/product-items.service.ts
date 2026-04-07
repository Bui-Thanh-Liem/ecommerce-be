import { Injectable } from '@nestjs/common';
import { CreateProductItemDto } from './dto/create-product-item.dto';
import { UpdateProductItemDto } from './dto/update-product-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductItemEntity } from './entities/product-item.entity';
import { Repository } from 'typeorm';
import { ProductVariantsService } from '../product-variants-SKU/product-variants.service';

@Injectable()
export class ProductItemsService {
  constructor(
    @InjectRepository(ProductItemEntity)
    private productItemRepo: Repository<ProductItemEntity>,
    private productVariantsService: ProductVariantsService,
    private,
  ) {}

  create(createProductItemDto: CreateProductItemDto) {
    const { productVariant, store } = createProductItemDto;

    const variant = aw;

    return 'This action adds a new productItem';
  }

  findAll() {
    return `This action returns all productItems`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productItem`;
  }

  update(id: number, updateProductItemDto: UpdateProductItemDto) {
    return `This action updates a #${id} productItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} productItem`;
  }
}
