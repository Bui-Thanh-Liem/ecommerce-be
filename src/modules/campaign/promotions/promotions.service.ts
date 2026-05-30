import { ConflictException, forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PromotionEntity } from './entities/promotion.entity';
import { DataSource, In, Not, Repository } from 'typeorm';
import { ProductVariantsService } from '../../catalog/product-variants-SKU/product-variants.service';
import { CampaignsService } from '../campaigns/campaigns.service';
import { StoresService } from '@/modules/inventory/stores/stores.service';
import { LocationRegionsService } from '@/modules/inventory/location-regions/location-regions.service';
import { CategoryPromotionService } from '../category-promotion/category-promotion.service';
import { ProductPromotionsService } from '../product-promotions/product-promotions.service';
import { stringToSlug } from '@/utils/string-to-slug.util';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { IMetadata } from '@/shared/interfaces/metadata.interface';
import { PromotionQueryDto } from './dto/query-promotion.dto';
import { calculatePagination } from '@/utils/pagination-calculator.util';

@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  constructor(
    @InjectRepository(PromotionEntity)
    private promotionRepository: Repository<PromotionEntity>,
    private cloudinaryService: CloudinaryService,
    private dataSource: DataSource,

    @Inject(forwardRef(() => CampaignsService))
    private readonly campaignsService: CampaignsService,

    private readonly pvService: ProductVariantsService,
    private readonly storesService: StoresService,
    private readonly locationRegionsService: LocationRegionsService,

    @Inject(forwardRef(() => CategoryPromotionService))
    private readonly categoryPromotionService: CategoryPromotionService,

    @Inject(forwardRef(() => ProductPromotionsService))
    private readonly productPromotionService: ProductPromotionsService,
  ) {}

  async create(createPromotionDto: CreatePromotionDto) {
    try {
      const {
        campaign: campaignId,
        productHighlighted: productHighlightedIds,
        stores: storeIds,
        locations: locationIds,
        categoryPromotions: categoryPromotionIds,
        productPromotions: productPromotionIds,
        name,
        ...rest
      } = createPromotionDto;
      const slug = stringToSlug(name);

      //
      const existingPromotion = await this.promotionRepository.exists({ where: { slug } });
      if (existingPromotion) {
        throw new NotFoundException(`Promotion with slug ${slug} already exists`);
      }

      const [eC, ePv, eS, eL, eCP, ePP] = await Promise.all([
        this.campaignsService.exists([campaignId]),
        this.pvService.exists(productHighlightedIds),
        storeIds ? this.storesService.exists(storeIds) : null,
        locationIds ? this.locationRegionsService.exists(locationIds) : null,
        categoryPromotionIds ? this.categoryPromotionService.exists(categoryPromotionIds) : null,
        productPromotionIds ? this.productPromotionService.exists(productPromotionIds) : null,
      ]);

      if (!eC) throw new NotFoundException('Campaign not found');
      if (!ePv) throw new NotFoundException('One or more ProductVariant IDs not found');
      if (!eS) throw new NotFoundException('One or more Store IDs not found');
      if (!eL) throw new NotFoundException('One or more LocationRegion IDs not found');
      if (!eCP) throw new NotFoundException('One or more CategoryPromotion IDs not found');
      if (!ePP) throw new NotFoundException('One or more ProductPromotion IDs not found');

      const promotion = this.promotionRepository.create({
        ...rest,
        slug,
        name,
        campaign: { id: campaignId },
        productHighlighted: productHighlightedIds.map((id) => ({ id })),
        stores: storeIds ? storeIds.map((id) => ({ id })) : undefined,
        locations: locationIds ? locationIds.map((id) => ({ id })) : undefined,
        categoryPromotions: categoryPromotionIds ? categoryPromotionIds.map((id) => ({ id })) : undefined,
        productPromotions: productPromotionIds ? productPromotionIds.map((id) => ({ id })) : undefined,
      });
      return await this.promotionRepository.save(promotion);
    } catch (error) {
      await this.removeImageForError(createPromotionDto.image?.key);
      this.logger.error(`Failed to create promotion`, error);
      throw error;
    }
  }

  async findAll(query: PromotionQueryDto): Promise<IMetadata<PromotionEntity>> {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    //
    const builder = this.promotionRepository
      .createQueryBuilder('promotion')

      // Join các quan hệ
      .leftJoinAndSelect('promotion.campaign', 'campaign')
      .leftJoinAndSelect('promotion.productHighlighted', 'phl')
      .leftJoinAndSelect('promotion.stores', 'stores')
      .leftJoinAndSelect('promotion.locations', 'locations')
      .leftJoinAndSelect('promotion.categoryPromotions', 'cp')
      .leftJoinAndSelect('promotion.productPromotions', 'pp');

    // Select các trường cụ thể (tương đương với select của bạn)
    builder
      .select([
        'promotion.id',
        'promotion.name',
        'promotion.slug',
        'promotion.image',
        'promotion.createdAt',

        'campaign.id',
        'campaign.name',

        'phl.id',
        'phl.sku',

        'stores.id',
        'stores.name',

        'locations.id',
        'locations.name',

        'cp.id',

        'pp.id',
      ])

      // Phân trang và sắp xếp
      .skip(skip)
      .take(take)
      .orderBy('promotion.createdAt', 'DESC'); // Nên có orderBy khi phân trang

    const [data, total] = await builder.take(take).skip(skip).getManyAndCount();

    // Chuyển đổi URL ảnh nếu có
    const dataWithUrls = await Promise.all(
      data.map(async (store) => {
        if (store.image && store.image.key) {
          store.image.url = await this.cloudinaryService.generateUrl(store.image.key);
        }
        return store;
      }),
    );

    return {
      data: dataWithUrls,
      totalData: total,
      page,
      totalPage: Math.ceil(total / limit),
    };
  }

  async findOptions(query: PromotionQueryDto): Promise<IMetadata<PromotionEntity>> {
    const { page, limit } = query;
    const { take, skip } = calculatePagination(page, limit);

    const queryBuilder = this.promotionRepository
      .createQueryBuilder('promotion')
      .select(['promotion.id', 'promotion.name', 'promotion.slug'])
      .skip(skip)
      .take(take)
      .orderBy('promotion.createdAt', 'DESC');

    const [data, totalData] = await queryBuilder.getManyAndCount();

    return {
      data,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async findOne(id: string) {
    return await this.promotionRepository.findOne({
      where: { id },
      relations: ['campaign', 'productHighlighted', 'stores', 'locations', 'categoryPromotions', 'productPromotions'],
    });
  }

  async exists(ids: string[]): Promise<boolean> {
    const count = await this.promotionRepository.count({ where: { id: In(ids) } });
    return count === ids.length;
  }

  async update(id: string, updatePromotionDto: UpdatePromotionDto) {
    const {
      campaign: campaignId,
      productHighlighted: productHighlightedIds,
      stores: storeIds,
      locations: locationIds,
      categoryPromotions: categoryPromotionIds,
      productPromotions: productPromotionIds,
      name,
      image,
      ...rest
    } = updatePromotionDto;

    // ==========================================
    // 1. VALIDATION & READS (Ngoài Transaction để giải phóng DB nhanh)
    // ==========================================

    // Lấy dữ liệu cũ để check tồn tại và giữ lại thông tin ảnh cũ
    const oldPromotion = await this.promotionRepository.findOne({
      where: { id },
      select: { id: true, name: true, slug: true, image: true },
    });
    if (!oldPromotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    const slug = name ? stringToSlug(name) : undefined;

    const [isSlugDup, eC, ePv, eS, eL, eCP, ePP] = await Promise.all([
      name ? this.promotionRepository.exists({ where: { slug, id: Not(id) } }) : null,
      campaignId ? this.campaignsService.exists([campaignId]) : null,
      productHighlightedIds ? this.pvService.exists(productHighlightedIds) : null,
      storeIds ? this.storesService.exists(storeIds) : null,
      locationIds ? this.locationRegionsService.exists(locationIds) : null,
      categoryPromotionIds ? this.categoryPromotionService.exists(categoryPromotionIds) : null,
      productPromotionIds ? this.productPromotionService.exists(productPromotionIds) : null,
    ]);

    if (isSlugDup) {
      throw new ConflictException('Promotion with this name already exists');
    }

    if (campaignId && !eC) throw new NotFoundException('Campaign not found');
    if (productHighlightedIds && !ePv) throw new NotFoundException('One or more ProductVariant IDs not found');
    if (storeIds && !eS) throw new NotFoundException('One or more Store IDs not found');
    if (locationIds && !eL) throw new NotFoundException('One or more LocationRegion IDs not found');
    if (categoryPromotionIds && !eCP) throw new NotFoundException('One or more CategoryPromotion IDs not found');
    if (productPromotionIds && !ePP) throw new NotFoundException('One or more ProductPromotion IDs not found');

    // Ghi nhận key ảnh cũ phục vụ việc xóa sau khi commit thành công
    const oldImageKey = oldPromotion.image?.key;

    // ==========================================
    // 2. TRANSACTION (Chỉ bọc các hành động ghi - WRITE)
    // ==========================================
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Merge dữ liệu mới vào thực thể cũ
      const updatedPromotion = this.promotionRepository.merge(oldPromotion, {
        ...rest,
        ...(name && { name, slug }),
        ...(campaignId && { campaign: { id: campaignId } }),
        ...(productHighlightedIds && { productHighlighted: productHighlightedIds.map((id) => ({ id })) }),
        ...(storeIds && { stores: storeIds.map((id) => ({ id })) }),
        ...(locationIds && { locations: locationIds.map((id) => ({ id })) }),
        ...(categoryPromotionIds && { categoryPromotions: categoryPromotionIds.map((id) => ({ id })) }),
        ...(productPromotionIds && { productPromotions: productPromotionIds.map((id) => ({ id })) }),
      });

      if (image !== undefined) {
        updatedPromotion.image = image; // Hoặc kiểu dữ liệu Entity tương ứng của bạn
      }

      // Lưu vào DB qua transaction manager
      await queryRunner.manager.save(PromotionEntity, updatedPromotion);

      // Chỉ commit khi DB hoàn tất
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Nếu DB lỗi, dọn dẹp ảnh MỚI vừa được truyền lên từ Dto để tránh rác Cloudinary
      if (image?.key) {
        await this.removeImageForError(image.key).catch((err) =>
          this.logger.error(`Failed to cleanup new promotion image on error`, err),
        );
      }

      this.logger.error(`Failed to update promotion with ID ${id}`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }

    // ==========================================
    // 3. CLEANUP CLOUDINARY (Sau khi DB thành công 100%)
    // ==========================================
    try {
      // Chỉ xóa ảnh cũ nếu có truyền ảnh mới lên, ảnh cũ có tồn tại và hai key khác nhau
      if (image !== undefined && oldImageKey && image.key !== oldImageKey) {
        await this.cloudinaryService.deleteImage(oldImageKey);
      }
    } catch (cloudError) {
      this.logger.warn(`Database updated but failed to delete old promotion image from Cloudinary`, cloudError);
    }
  }

  async remove(id: string) {
    const promotion = await this.promotionRepository.findOneBy({ id });
    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    // 1. Xóa trong DB trước
    await this.promotionRepository.remove(promotion);

    // 2. DB đã sạch sẽ rồi, xóa ảnh
    if (promotion.image && promotion.image.key) {
      await this.cloudinaryService.deleteImage(promotion.image.key);
    }

    return true;
  }

  private async removeImageForError(key?: string) {
    if (!key) return;
    return await this.cloudinaryService.deleteImage(key);
  }
}
