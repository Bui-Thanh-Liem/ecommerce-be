import { ConflictException, forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateCategoryPromotionDto } from './dto/create-category-promotion.dto';
import { UpdateCategoryPromotionDto } from './dto/update-category-promotion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryPromotionEntity } from './entities/category-promotion.entity';
import { In, Not, Repository } from 'typeorm';
import { PromotionsService } from '../promotions/promotions.service';
import { CategoriesService } from '@/modules/catalog/categories/categories.service';
import { CategoryPromotionQueryDto } from './dto/query-category-promotion.dto';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { ProductVariantEntity } from '@/modules/catalog/product-variants-SKU/entities/product-variant.entity';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';

@Injectable()
export class CategoryPromotionService {
  private readonly logger = new Logger(CategoryPromotionService.name);

  constructor(
    @InjectRepository(CategoryPromotionEntity)
    private categoryPromotionRepository: Repository<CategoryPromotionEntity>,

    @InjectRepository(ProductVariantEntity)
    private productVariantRepo: Repository<ProductVariantEntity>,

    @Inject(forwardRef(() => PromotionsService))
    private readonly promotionsService: PromotionsService,

    private readonly categoriesService: CategoriesService,

    private readonly cloudinaryService: CloudinaryService,
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
      if (!eC) throw new NotFoundException(`Category not found`);
      if (!eP) throw new NotFoundException(`Promotion not found`);
      if (eE) throw new ConflictException(`Category Promotion with Category  and Promotion already exists`);

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
      .select([
        'cp.id',
        'cp.priority',
        'cp.createdAt',
        'cp.customDiscount',

        'promotion.id',
        'promotion.name',
        'promotion.image',

        'category.id',
        'category.name',
      ])

      // Phân trang và sắp xếp
      .skip(skip)
      .take(take)
      .orderBy('cp.createdAt', 'DESC');

    const [data, total] = await builder.take(take).skip(skip).getManyAndCount();

    const signedData = await this.signUrl(data);

    return {
      data: signedData,
      totalData: total,
      page,
      totalPage: Math.ceil(total / limit),
    };
  }

  async findOptions(query: CategoryPromotionQueryDto) {
    const { page, limit, filters } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    //
    const builder = this.categoryPromotionRepository
      .createQueryBuilder('cp')

      // Join các quan hệ
      .leftJoinAndSelect('cp.promotion', 'promotion')
      .leftJoinAndSelect('cp.category', 'category');

    //
    if (filters?.promotion) {
      builder.andWhere('cp.promotion = :promotionId', { promotionId: filters.promotion });
    }

    // Select các trường cụ thể (tương đương với select của bạn)
    builder
      .select([
        'cp.id',
        'cp.priority',
        'cp.createdAt',
        'cp.customDiscount',

        'promotion.id',
        'promotion.name',
        'promotion.image',

        'category.id',
        'category.name',
      ])

      // Phân trang và sắp xếp
      .skip(skip)
      .take(take)
      .orderBy('cp.createdAt', 'DESC');

    const [data, total] = await builder.take(take).skip(skip).getManyAndCount();

    const signedData = await this.signUrl(data);

    return {
      data: signedData,
      totalData: total,
      page,
      totalPage: Math.ceil(total / limit),
    };
  }

  async findVariantByPromotion(query: CategoryPromotionQueryDto) {
    const { page, limit, filters } = query;
    const { take, skip } = calculatePagination(page, limit);

    // 1. Khởi tạo gốc từ bảng 'product_variants'
    const queryBuilder = this.productVariantRepo.createQueryBuilder('variant');

    // Join các bảng liên quan (Chỉ dùng leftJoin, không dùng leftJoinAndSelect để tránh lấy thừa dữ liệu)
    queryBuilder.leftJoin('variant.product', 'product').leftJoin('product.category', 'category');

    // Khởi tạo các trường select mặc định (giống cấu trúc pv và product bên findOptions)
    queryBuilder.select([
      'variant.id',
      'variant.sku',
      'variant.price',
      'variant.salesAttributes',
      'variant.createdAt', // Dùng để bổ sung sắp xếp nếu không có promotion

      'product.id',
      'product.name',
      'product.thumbnail',
    ]);

    // 2. Xử lý bộ lọc theo Chiến dịch Khuyến mãi Danh mục
    if (filters?.promotion) {
      // Inner join với bảng trung gian category_promotions
      queryBuilder.innerJoin('category_promotions', 'cp', 'cp.category = category.id AND cp.promotion = :promotionId', {
        promotionId: filters.promotion,
      });

      // Left join sang bảng promotions tổng
      queryBuilder.leftJoin('promotions', 'promotion', 'promotion.id = cp.promotionId');

      // Bổ sung các trường của Promotion và bảng cấu hình trung gian vào danh sách Select
      queryBuilder.addSelect([
        'cp.id',
        'cp.priority',
        'cp.customDiscount',

        'promotion.id',
        'promotion.name',
        'promotion.discountPercentage',
      ]);

      // Sắp xếp ưu tiên theo cấu hình của chiến dịch danh mục giống code cũ của bạn
      queryBuilder.orderBy('cp.priority', 'DESC');
    } else {
      queryBuilder.orderBy('variant.createdAt', 'DESC');
    }

    // Thêm điều kiện sắp xếp phụ
    queryBuilder.addOrderBy('variant.createdAt', 'DESC');

    // 3. Phân trang và lấy dữ liệu
    const { raw, entities } = await queryBuilder.skip(skip).take(take).getRawAndEntities();

    // 4. Map lại cấu trúc data output cho giống hệt findOptions nếu cần
    const total = await queryBuilder.getCount();

    // 4. Map lại cấu trúc dữ liệu chính xác dựa trên mảng 'raw'
    // TypeORM khi xuất dữ liệu raw sẽ tự động nối tên alias và tên cột bằng dấu gạch dưới (_)
    const formattedData = raw.map((row) => {
      // Tìm thực thể variant tương ứng để lấy mảng salesAttributes đã tự động parse thành Object
      const variantEntity = entities.find((e) => e.id === row.variant_id);

      return {
        id: row.cp_id || row.variant_id,
        createdAt: row.cp_createdAt || row.variant_createdAt,
        productVariant: {
          id: row.variant_id,
          product: row.product_id
            ? {
                id: row.product_id,
                name: row.product_name,
                thumbnail: row.product_thumbnail,
              }
            : null,
          sku: row.variant_sku,
          price: row.variant_price ? parseFloat(row.variant_price) : 0,
          salesAttributes: variantEntity?.salesAttributes || [],
        },
        promotion: row.promotion_id
          ? {
              id: row.promotion_id,
              name: row.promotion_name,
            }
          : null,
        customDiscount: row.cp_customDiscount ? parseFloat(row.cp_customDiscount) : null,
        priority: row.cp_priority ? parseInt(row.cp_priority, 10) : null,
      };
    });

    // 5. Trả về đúng format đầu ra giống findOptions
    return {
      data: formattedData,
      totalData: total,
      page,
      totalPage: Math.ceil(total / limit),
    };
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
          if (!exists) throw new NotFoundException(`Category not found`);
        }),
      );
    }

    // Nếu thay đổi promotion, check xem promotion mới có tồn tại không
    if (promotionId) {
      checks.push(
        this.promotionsService.exists([promotionId]).then((exists) => {
          if (!exists) throw new NotFoundException(`Promotion not found`);
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
            if (isDuplicate)
              throw new ConflictException('Category Promotion with the same Category and Promotion already exists');
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
      throw new NotFoundException(`Category Promotion not found`);
    }
    return await this.categoryPromotionRepository.remove(categoryPromotion);
  }

  async signUrl(data: CategoryPromotionEntity[]): Promise<CategoryPromotionEntity[]> {
    return await Promise.all(
      data.map(async (cp) => {
        const imageKey = cp.promotion.image?.key;
        const imageUrl = await this.cloudinaryService.generateUrl(imageKey);

        return {
          ...cp,
          promotion: {
            ...cp.promotion,
            image: {
              ...cp.promotion.image,
              url: imageUrl,
            },
          },
        } as CategoryPromotionEntity;
      }),
    );
  }
}
