import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryPromotionDto } from './dto/create-category-promotion.dto';
import { UpdateCategoryPromotionDto } from './dto/update-category-promotion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryPromotionEntity } from './entities/category-promotion.entity';
import { Repository } from 'typeorm';
import { PromotionsService } from '../promotions/promotions.service';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class CategoryPromotionService {
  constructor(
    @InjectRepository(CategoryPromotionEntity)
    private categoryPromotionRepository: Repository<CategoryPromotionEntity>,

    private readonly promotionsService: PromotionsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createCategoryPromotionDto: CreateCategoryPromotionDto) {
    const { category: categoryId, promotion: promotionId, ...rest } = createCategoryPromotionDto;

    //
    const categoryExists = await this.categoriesService.exists([categoryId]);
    if (!categoryExists) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    //
    const promotionExists = await this.promotionsService.exists([promotionId]);
    if (!promotionExists) {
      throw new NotFoundException(`Promotion with ID ${promotionId} not found`);
    }

    const categoryPromotion = this.categoryPromotionRepository.create({
      ...rest,
      category: { id: categoryId },
      promotion: { id: promotionId },
    });
    return await this.categoryPromotionRepository.save(categoryPromotion);
  }

  async findAll() {
    return await this.categoryPromotionRepository.find({ relations: ['category', 'promotion'] });
  }

  async findOne(id: string) {
    return await this.categoryPromotionRepository.findOne({
      where: { id },
      relations: ['category', 'promotion'],
    });
  }

  async update(id: string, updateCategoryPromotionDto: UpdateCategoryPromotionDto) {
    const { category: categoryId, promotion: promotionId, ...rest } = updateCategoryPromotionDto;

    //
    if (categoryId) {
      const categoryExists = await this.categoriesService.exists([categoryId]);
      if (!categoryExists) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }
    }

    //
    if (promotionId) {
      const promotionExists = await this.promotionsService.exists([promotionId]);
      if (!promotionExists) {
        throw new NotFoundException(`Promotion with ID ${promotionId} not found`);
      }
    }

    const categoryPromotion = await this.categoryPromotionRepository.preload({
      id,
      ...rest,
      category: categoryId ? { id: categoryId } : undefined,
      promotion: promotionId ? { id: promotionId } : undefined,
    });
    if (!categoryPromotion) {
      throw new NotFoundException(`Category Promotion with ID ${id} not found`);
    }
    return await this.categoryPromotionRepository.save(categoryPromotion);
  }

  async remove(id: string) {
    const categoryPromotion = await this.findOne(id);
    if (!categoryPromotion) {
      throw new NotFoundException(`Category Promotion with ID ${id} not found`);
    }
    return await this.categoryPromotionRepository.remove(categoryPromotion);
  }
}
