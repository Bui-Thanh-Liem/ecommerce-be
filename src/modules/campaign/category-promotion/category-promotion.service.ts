import { BadRequestException, forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateCategoryPromotionDto } from './dto/create-category-promotion.dto';
import { UpdateCategoryPromotionDto } from './dto/update-category-promotion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryPromotionEntity } from './entities/category-promotion.entity';
import { In, Not, Repository } from 'typeorm';
import { PromotionsService } from '../promotions/promotions.service';
import { CategoriesService } from '@/modules/catalog/categories/categories.service';
import { CategoryPromotionQueryDto } from './dto/query-category-promotion.dto';
import { calculatePagination } from '@/utils/pagination-calculator.util';

@Injectable()
export class CategoryPromotionService {
  private readonly logger = new Logger(CategoryPromotionService.name);

  constructor(
    @InjectRepository(CategoryPromotionEntity)
    private categoryPromotionRepository: Repository<CategoryPromotionEntity>,

    @Inject(forwardRef(() => PromotionsService))
    private readonly promotionsService: PromotionsService,

    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createCategoryPromotionDto: CreateCategoryPromotionDto) {
    try {
      const { category: categoryId, promotion: promotionId, ...rest } = createCategoryPromotionDto;

      //
      const [eC, eP, eE] = await Promise.all([
        this.categoriesService.exists([categoryId]),
        this.promotionsService.exists([promotionId]),
        this.categoryPromotionRepository.exists({
          where: { category: { id: categoryId }, promotion: { id: promotionId } },
        }),
      ]);

      //
      if (!eC) throw new NotFoundException(`Category with ID ${categoryId} not found`);
      if (!eP) throw new NotFoundException(`Promotion with ID ${promotionId} not found`);
      if (eE)
        throw new NotFoundException(
          `Category Promotion with Category ID ${categoryId} and Promotion ID ${promotionId} already exists`,
        );

      const categoryPromotion = this.categoryPromotionRepository.create({
        ...rest,
        category: { id: categoryId },
        promotion: { id: promotionId },
      });
      return await this.categoryPromotionRepository.save(categoryPromotion);
    } catch (error) {
      this.logger.error(`Failed to create category promotion`, error);
      throw error;
    }
  }

  async findAll(query: CategoryPromotionQueryDto) {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    //
    const builder = this.categoryPromotionRepository
      .createQueryBuilder('cp')

      // Join các quan hệ
      .leftJoinAndSelect('cp.promotion', 'promotion')
      .leftJoinAndSelect('cp.category', 'category');

    // Select các trường cụ thể (tương đương với select của bạn)
    builder
      .select(['cp.id', 'cp.createdAt', 'promotion.id', 'promotion.name', 'category.id', 'category.name'])

      // Phân trang và sắp xếp
      .skip(skip)
      .take(take)
      .orderBy('cp.createdAt', 'DESC');

    return await this.categoryPromotionRepository.find({ relations: ['category', 'promotion'] });
  }

  async exists(ids: string[]): Promise<boolean> {
    const count = await this.categoryPromotionRepository.count({ where: { id: In(ids) } });
    return count === ids.length;
  }

  async findOne(id: string) {
    return await this.categoryPromotionRepository.findOne({
      where: { id },
      relations: ['category', 'promotion'],
    });
  }

  async update(id: string, updateCategoryPromotionDto: UpdateCategoryPromotionDto) {
    const { category: categoryId, promotion: promotionId, ...rest } = updateCategoryPromotionDto;

    // 1. Kiểm tra bản ghi hiện tại có tồn tại không và lấy luôn dữ liệu cũ để phục vụ check Unique
    const currentCP = await this.categoryPromotionRepository.findOne({
      where: { id },
      relations: ['category', 'promotion'], // Load relations để tránh crash logUpdate khi save
    });
    if (!currentCP) throw new NotFoundException('Category Promotion not found');

    // Xác định ID cuối cùng sau khi update sẽ là gì
    const finalCategoryId = categoryId ?? currentCP.category.id;
    const finalPromotionId = promotionId ?? currentCP.promotion.id;

    // 2. Gom tất cả các check logic vào một Promise.all duy nhất
    const checks: Promise<void>[] = [];

    // Nếu thay đổi category, check xem category mới có tồn tại không
    if (categoryId) {
      checks.push(
        this.categoriesService.exists([categoryId]).then((exists) => {
          if (!exists) throw new NotFoundException(`Category with ID ${categoryId} not found`);
        }),
      );
    }

    // Nếu thay đổi promotion, check xem promotion mới có tồn tại không
    if (promotionId) {
      checks.push(
        this.promotionsService.exists([promotionId]).then((exists) => {
          if (!exists) throw new NotFoundException(`Promotion with ID ${promotionId} not found`);
        }),
      );
    }

    // Nếu có bất kỳ sự thay đổi nào về cặp (category, promotion), check trùng unique
    if (categoryId || promotionId) {
      checks.push(
        this.categoryPromotionRepository
          .exists({
            where: {
              category: { id: finalCategoryId },
              promotion: { id: finalPromotionId },
              id: Not(id),
            },
          })
          .then((isDuplicate) => {
            if (isDuplicate) throw new BadRequestException('Mối quan hệ Category và Promotion này đã tồn tại!');
          }),
      );
    }

    // Chạy song song tất cả các điều kiện validate
    await Promise.all(checks);

    // 3. Tiến hành merge và lưu dữ liệu
    // Thay vì dùng preload (dễ lỗi relation), ta merge trực tiếp dữ liệu mới vào bản ghi hiện tại
    const updatedCategoryPromotion = this.categoryPromotionRepository.merge(currentCP, {
      ...rest,
      category: categoryId ? { id: categoryId } : undefined,
      promotion: promotionId ? { id: promotionId } : undefined,
    });

    return await this.categoryPromotionRepository.save(updatedCategoryPromotion);
  }

  async remove(id: string) {
    const categoryPromotion = await this.findOne(id);
    if (!categoryPromotion) {
      throw new NotFoundException(`Category Promotion with ID ${id} not found`);
    }
    return await this.categoryPromotionRepository.remove(categoryPromotion);
  }
}
