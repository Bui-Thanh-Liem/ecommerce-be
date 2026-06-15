import { ConflictException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductPromotionDto } from './dto/create-product-promotion.dto';
import { UpdateProductPromotionDto } from './dto/update-product-promotion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductPromotionEntity } from './entities/product-promotion.entity';
import { In, Not, Repository } from 'typeorm';
import { PromotionsService } from '../promotions/promotions.service';
import { ProductVariantsService } from '@/modules/catalog/product-variants-SKU/product-variants.service';
import { ProductPromotionQueryDto } from './dto/query-product-promotion.dto';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { Logger } from '@nestjs/common';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';

@Injectable()
export class ProductPromotionsService {
  private readonly logger = new Logger(ProductPromotionsService.name);

  constructor(
    @InjectRepository(ProductPromotionEntity)
    private productPromotionRepository: Repository<ProductPromotionEntity>,

    @Inject(forwardRef(() => PromotionsService))
    private readonly promotionsService: PromotionsService,
    private readonly variantService: ProductVariantsService,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createProductPromotionDto: CreateProductPromotionDto) {
    try {
      const { productVariant: productVariantId, promotion: promotionId, ...rest } = createProductPromotionDto;

      //
      const [eC, eP, eE] = await Promise.all([
        this.variantService.exists([productVariantId]),
        this.promotionsService.exists([promotionId]),
        this.productPromotionRepository.exists({
          where: { productVariant: { id: productVariantId }, promotion: { id: promotionId } },
        }),
      ]);

      //
      if (!eC) throw new NotFoundException(`Product variant not found`);
      if (!eP) throw new NotFoundException(`Promotion not found`);
      if (eE) throw new ConflictException(`Product Promotion with Product Variant and Promotion already exists`);

      //
      const productPromotion = this.productPromotionRepository.create({
        ...rest,
        productVariant: { id: productVariantId },
        promotion: { id: promotionId },
      });
      return await this.productPromotionRepository.save(productPromotion);
    } catch (error) {
      this.logger.error(`Failed to create product promotion`, error);
      throw error;
    }
  }

  async findAll(query: ProductPromotionQueryDto) {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    //
    const builder = this.productPromotionRepository
      .createQueryBuilder('pp')

      // Join các quan hệ
      .leftJoinAndSelect('pp.promotion', 'promotion')
      .leftJoinAndSelect('pp.productVariant', 'pv')
      .leftJoinAndSelect('pv.product', 'product');

    // Select các trường cụ thể (tương đương với select của bạn)
    builder
      .select([
        'pp.id',
        'pp.priority',
        'pp.createdAt',
        'pp.customDiscount',

        'promotion.id',
        'promotion.name',
        'promotion.image',

        'pv.id',
        'pv.sku',
        'pv.salesAttributes',

        'product.id',
        'product.name',
      ])

      // Phân trang và sắp xếp
      .skip(skip)
      .take(take)
      .orderBy('pp.createdAt', 'DESC');

    const [data, total] = await builder.take(take).skip(skip).getManyAndCount();

    const signedData = await this.signUrl(data);

    return {
      data: signedData,
      totalData: total,
      page,
      totalPage: Math.ceil(total / limit),
    };
  }

  async findOptions(query: ProductPromotionQueryDto) {
    const { page, limit, filters } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    //
    const builder = this.productPromotionRepository
      .createQueryBuilder('pp')

      // Join các quan hệ
      .leftJoinAndSelect('pp.promotion', 'promotion')
      .leftJoinAndSelect('pp.productVariant', 'pv')
      .leftJoinAndSelect('pv.product', 'product');

    // Select các trường cụ thể (tương đương với select của bạn)
    builder.select([
      'pp.id',
      'pp.priority',
      'pp.createdAt',
      'pp.customDiscount',

      'promotion.id',
      'promotion.name',
      'promotion.image',

      'pv.id',
      'pv.sku',
      'pv.price',
      'pv.salesAttributes',

      'product.id',
      'product.name',
      'product.thumbnail',
    ]);

    //
    if (filters?.promotion) {
      builder.andWhere('pp.promotion = :promotionId', { promotionId: filters.promotion });
    }

    // Phân trang và sắp xếp
    builder.skip(skip).take(take).orderBy('pp.createdAt', 'DESC');

    const [data, total] = await builder.take(take).skip(skip).getManyAndCount();

    const signedData = await this.signUrl(data);

    return {
      data: signedData,
      totalData: total,
      page,
      totalPage: Math.ceil(total / limit),
    };
  }

  async exists(ids: string[]): Promise<boolean> {
    const count = await this.productPromotionRepository.count({ where: { id: In(ids) } });
    return count === ids.length;
  }

  async findOne(id: string) {
    return await this.productPromotionRepository.findOne({ where: { id }, relations: ['productVariant', 'promotion'] });
  }

  async update(id: string, updateProductPromotionDto: UpdateProductPromotionDto) {
    const { productVariant: productVariantId, promotion: promotionId, ...rest } = updateProductPromotionDto;

    // 1. Kiểm tra bản ghi hiện tại có tồn tại không và lấy luôn dữ liệu cũ để phục vụ check Unique
    const currentPP = await this.productPromotionRepository.findOne({
      where: { id },
      relations: ['productVariant', 'promotion'], // Load relations để tránh crash logUpdate khi save
    });
    if (!currentPP) throw new NotFoundException('Product Promotion not found');

    // Xác định ID cuối cùng sau khi update sẽ là gì
    const finalProductVariantId = productVariantId ?? currentPP.productVariant.id;
    const finalPromotionId = promotionId ?? currentPP.promotion.id;

    // 2. Gom tất cả các check logic vào một Promise.all duy nhất
    const checks: Promise<void>[] = [];

    // Nếu thay đổi productVariant, check xem productVariant mới có tồn tại không
    if (productVariantId) {
      checks.push(
        this.variantService.exists([productVariantId]).then((exists) => {
          if (!exists) throw new NotFoundException(`Product variant not found`);
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

    // Nếu có bất kỳ sự thay đổi nào về cặp (productVariant, promotion), check trùng unique
    if (productVariantId || promotionId) {
      checks.push(
        this.productPromotionRepository
          .exists({
            where: {
              productVariant: { id: finalProductVariantId },
              promotion: { id: finalPromotionId },
              id: Not(id),
            },
          })
          .then((isDuplicate) => {
            if (isDuplicate)
              throw new ConflictException(
                'Product Promotion with the same Product Variant and Promotion already exists',
              );
          }),
      );
    }

    // Chạy song song tất cả các điều kiện validate
    await Promise.all(checks);

    // 3. Tiến hành merge và lưu dữ liệu
    // Thay vì dùng preload (dễ lỗi relation), ta merge trực tiếp dữ liệu mới vào bản ghi hiện tại
    const updatedProductPromotion = this.productPromotionRepository.merge(currentPP, {
      ...rest,
      productVariant: productVariantId ? { id: productVariantId } : undefined,
      promotion: promotionId ? { id: promotionId } : undefined,
    });

    return await this.productPromotionRepository.save(updatedProductPromotion);
  }

  async remove(id: string) {
    const productPromotion = await this.findOne(id);
    if (!productPromotion) {
      throw new NotFoundException(`Product promotion not found`);
    }

    return await this.productPromotionRepository.remove(productPromotion);
  }

  async signUrl(data: ProductPromotionEntity[]): Promise<ProductPromotionEntity[]> {
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
        } as ProductPromotionEntity;
      }),
    );
  }
}
