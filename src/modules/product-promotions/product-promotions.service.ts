import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductPromotionDto } from './dto/create-product-promotion.dto';
import { UpdateProductPromotionDto } from './dto/update-product-promotion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductPromotionEntity } from './entities/product-promotion.entity';
import { Repository } from 'typeorm';
import { PromotionsService } from '../promotions/promotions.service';
import { ProductVariantsService } from '../product-variants-SKU/product-variants.service';

@Injectable()
export class ProductPromotionsService {
  constructor(
    @InjectRepository(ProductPromotionEntity)
    private productPromotionRepository: Repository<ProductPromotionEntity>,

    private readonly promotionsService: PromotionsService,
    private readonly variantService: ProductVariantsService,
  ) {}

  async create(createProductPromotionDto: CreateProductPromotionDto) {
    const { productVariant: productVariantId, promotion: promotionId, ...rest } = createProductPromotionDto;

    const promotionExists = await this.promotionsService.exists([promotionId]);
    if (!promotionExists) {
      throw new NotFoundException(`Promotion with ID ${promotionId} not found`);
    }

    const pvExists = await this.variantService.exists([productVariantId]);
    if (!pvExists) {
      throw new NotFoundException(`Product variant with ID ${productVariantId} not found`);
    }

    const productPromotion = this.productPromotionRepository.create({
      productVariant: { id: productVariantId },
      promotion: { id: promotionId },
      ...rest,
    });

    return await this.productPromotionRepository.save(productPromotion);
  }

  async findAll() {
    return await this.productPromotionRepository.find({ relations: ['productVariant', 'promotion'] });
  }

  async findOne(id: string) {
    return await this.productPromotionRepository.findOne({ where: { id }, relations: ['productVariant', 'promotion'] });
  }

  async update(id: string, updateProductPromotionDto: UpdateProductPromotionDto) {
    const productPromotion = await this.findOne(id);
    if (!productPromotion) {
      throw new NotFoundException(`Product promotion with ID ${id} not found`);
    }

    Object.assign(productPromotion, updateProductPromotionDto);
    return await this.productPromotionRepository.save(productPromotion);
  }

  async remove(id: string) {
    const productPromotion = await this.findOne(id);
    if (!productPromotion) {
      throw new NotFoundException(`Product promotion with ID ${id} not found`);
    }

    return await this.productPromotionRepository.remove(productPromotion);
  }
}
