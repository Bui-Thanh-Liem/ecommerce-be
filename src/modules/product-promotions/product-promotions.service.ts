import { Injectable } from '@nestjs/common';
import { CreateProductPromotionDto } from './dto/create-product-promotion.dto';
import { UpdateProductPromotionDto } from './dto/update-product-promotion.dto';

@Injectable()
export class ProductPromotionsService {
  create(createProductPromotionDto: CreateProductPromotionDto) {
    return 'This action adds a new productPromotion';
  }

  findAll() {
    return `This action returns all productPromotions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productPromotion`;
  }

  update(id: number, updateProductPromotionDto: UpdateProductPromotionDto) {
    return `This action updates a #${id} productPromotion`;
  }

  remove(id: number) {
    return `This action removes a #${id} productPromotion`;
  }
}
