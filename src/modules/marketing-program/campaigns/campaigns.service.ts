import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { stringToSlug } from '@/utils/string-to-slug.util';
import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, Repository } from 'typeorm';
import { PromotionsService } from '../promotions/promotions.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CampaignQueryDto } from './dto/query-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignEntity } from './entities/campaign.entity';
import { ProductVariantsService } from '@/modules/catalog/product-variants-SKU/product-variants.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MarketingProgramsService } from '../marketing-programs/marketing-programs.service';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    @InjectRepository(CampaignEntity)
    private campaignRepository: Repository<CampaignEntity>,

    @Inject(forwardRef(() => PromotionsService))
    private readonly promotionService: PromotionsService,

    @InjectQueue('cloudinary')
    private readonly cloudinaryQueue: Queue,

    private readonly cloudinaryService: CloudinaryService,

    private readonly pvService: ProductVariantsService,

    @Inject(forwardRef(() => MarketingProgramsService))
    private readonly mktProgramService: MarketingProgramsService,

    private dataSource: DataSource,
  ) {}

  async create(dto: CreateCampaignDto) {
    try {
      const {
        name,
        endDate,
        startDate,
        promotions: promotionIds,
        marketingProgram: marketingProgramId,
        productHighlighted: productVariantIds,
        ...rest
      } = dto;

      //
      if (startDate >= endDate) {
        throw new BadGatewayException('Start date must be before end date');
      }

      //
      const slug = stringToSlug(name);
      const hasPromotions = promotionIds && promotionIds.length > 0;
      const hasProductVariants = productVariantIds && productVariantIds.length > 0;
      const [existingCampaign, promotionsExist, productVariantsExist, marketingProgramExist] = await Promise.all([
        this.campaignRepository.exists({ where: { slug } }),
        hasPromotions ? this.promotionService.exists(promotionIds) : null,
        hasProductVariants ? this.pvService.exists(productVariantIds) : null,
        marketingProgramId ? this.mktProgramService.exists([marketingProgramId]) : null,
      ]);

      //
      if (existingCampaign) {
        throw new ConflictException('A campaign with the same name already exists');
      }
      if (hasPromotions && !promotionsExist) {
        throw new NotFoundException('One or more Promotion not found');
      }
      if (hasProductVariants && !productVariantsExist) {
        throw new NotFoundException('One or more Product Variant not found');
      }
      if (marketingProgramId && !marketingProgramExist) {
        throw new NotFoundException('Marketing program not found');
      }

      const campaign = this.campaignRepository.create({
        ...rest,
        name,
        slug,
        startDate,
        endDate,
        promotions: promotionIds?.map((id) => ({ id })) || [],
        productHighlighted: productVariantIds?.map((id) => ({ id })) || [],
        marketingProgram: marketingProgramId ? { id: marketingProgramId } : undefined,
      });
      return await this.campaignRepository.save(campaign);
    } catch (error) {
      const keys = [...(dto?.images?.map((img) => img.key) || []), dto?.mainImage.key];
      await this.removeImagesForError(keys);
      this.logger.error(`Failed to create brand`, error);
      throw error;
    }
  }

  async findAll(query: CampaignQueryDto): Promise<IMetadata<CampaignEntity>> {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    //
    const queryBuilder = this.campaignRepository
      .createQueryBuilder('campaign')

      // Join các quan hệ
      .leftJoinAndSelect('campaign.promotions', 'promotions')
      .leftJoinAndSelect('campaign.productHighlighted', 'product_highlighted')
      .leftJoinAndSelect('campaign.marketingProgram', 'marketing_program')
      .leftJoinAndSelect('product_highlighted.product', 'product')

      // Select các trường cụ thể (tương đương với select của bạn)
      .select([
        'campaign.id',
        'campaign.name',
        'campaign.slug',
        'campaign.desc',
        'campaign.isActive',
        'campaign.mainImage',
        'campaign.images',
        'campaign.startDate',
        'campaign.endDate',
        'campaign.createdAt',

        // Trường hợp ít promotions, nếu nhiều không join và select,
        // Mà để FE gọi API riêng lấy campaign theo campaignId
        'promotions.id',
        'promotions.name',

        'product_highlighted.id',
        'product_highlighted.sku',

        'marketing_program.id',
        'marketing_program.name',
        'marketing_program.mainImage',

        'product.id',
        'product.name',
      ])

      // Phân trang và sắp xếp
      .orderBy('campaign.createdAt', 'DESC')
      .skip(skip)
      .take(take);

    const [data, totalData] = await queryBuilder.getManyAndCount();

    //
    const dataWithUrls = await this.signUrl(data);

    return {
      data: dataWithUrls,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async findOptions(query: CampaignQueryDto): Promise<IMetadata<CampaignEntity>> {
    const { page, limit, filters } = query;
    const { take, skip } = calculatePagination(page, limit);

    //
    const queryBuilder = this.campaignRepository
      .createQueryBuilder('campaign')
      .select([
        'campaign.id',
        'campaign.name',
        'campaign.slug',
        'campaign.mainImage',
        'campaign.startDate',
        'campaign.endDate',
      ]);

    //
    if (filters?.marketingProgram) {
      queryBuilder.andWhere('campaign.marketingProgram = :mktId', { mktId: filters.marketingProgram });
    }

    queryBuilder.skip(skip).take(take).orderBy('campaign.createdAt', 'DESC');

    //
    const [data, totalData] = await queryBuilder.getManyAndCount();

    //
    const dataWithUrls = await this.signUrl(data);

    //
    return {
      data: dataWithUrls,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async findOne(id: string) {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['promotions', 'productHighlighted', 'marketingProgram'],
    });

    const mainImageKey = campaign?.mainImage?.key;
    if (mainImageKey) {
      campaign.mainImage = {
        ...campaign.mainImage,
        url: await this.cloudinaryService.generateUrl(mainImageKey),
      };
    }
    if (campaign?.images) {
      campaign.images = await this.cloudinaryService.generateUrls(campaign?.images || []);
    }
    return campaign;
  }

  async exists(ids: string[]): Promise<boolean> {
    const count = await this.campaignRepository.count({ where: { id: In(ids) } });
    return count === ids.length;
  }

  async update(id: string, dto: UpdateCampaignDto) {
    const {
      name,
      images,
      endDate,
      mainImage,
      startDate,
      promotions: promotionIds,
      marketingProgram: marketingProgramId,
      productHighlighted: productVariantIds,
      ...rest
    } = dto;

    // ==========================================
    // 1. VALIDATION & READS (Ngoài Transaction để giải phóng DB nhanh)
    // ==========================================

    // Validate ngày tháng ngay lập tức, tránh đụng vào DB nếu dữ liệu lỗi
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Lấy dữ liệu cũ để check tồn tại và lấy key ảnh
    const oldCampaign = await this.campaignRepository.findOne({
      where: { id },
      select: { id: true, images: true, mainImage: true },
    });
    if (!oldCampaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    const slug = name ? stringToSlug(name) : undefined;
    const hasPromotions = promotionIds && promotionIds.length > 0;
    const hasProductVariants = productVariantIds && productVariantIds.length > 0;

    // Chạy song song các câu lệnh check độc lập
    const [isSlugDup, isPromoValid, isProductVariantValid, isMarketingProgramValid] = await Promise.all([
      name ? this.campaignRepository.exists({ where: { slug, id: Not(id) } }) : null,
      hasPromotions ? this.promotionService.exists(promotionIds) : null,
      hasProductVariants ? this.pvService.exists(productVariantIds) : null,
      marketingProgramId ? this.mktProgramService.exists([marketingProgramId]) : null,
    ]);

    // Nếu có lỗi, trả về ngay mà không cần đụng vào DB nữa
    if (isSlugDup) throw new ConflictException('A campaign with the same name already exists');
    if (hasPromotions && !isPromoValid) throw new BadRequestException(`One or more Promotion IDs not found`);
    if (hasProductVariants && !isProductVariantValid)
      throw new BadRequestException(`One or more Product Variant IDs not found`);
    if (marketingProgramId && !isMarketingProgramValid) throw new BadRequestException(`Marketing Program ID not found`);

    // ==========================================
    // 2. TRANSACTION (Chỉ bọc các hành động ghi - WRITE)
    // ==========================================
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Merge dữ liệu mới vào thực thể cũ
      const updatedCampaign = this.campaignRepository.merge(oldCampaign, {
        ...rest,
        ...(name && { name, slug }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(marketingProgramId && { marketingProgram: { id: marketingProgramId } }),
        ...(promotionIds && { promotions: promotionIds.map((pId) => ({ id: pId })) }),
        ...(productVariantIds && { productHighlighted: productVariantIds.map((pvId) => ({ id: pvId })) }),
      });

      if (images !== undefined) updatedCampaign.images = images;
      if (mainImage !== undefined) updatedCampaign.mainImage = mainImage;

      // Lưu vào DB qua transaction manager
      await queryRunner.manager.save(CampaignEntity, updatedCampaign);

      // Chỉ commit khi DB hoàn tất
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Nếu DB lỗi, dọn dẹp các ảnh MỚI vừa được upload lên (nếu có) trước đó ngoài API
      const newKeys = [...(images?.map((img) => img.key) || []), mainImage?.key].filter((k): k is string => !!k);
      if (newKeys.length > 0) {
        await this.removeImagesForError(newKeys).catch((err) =>
          this.logger.error(`Failed to cleanup new images on error`, err),
        );
      }

      this.logger.error(`Failed to update campaign`);
      throw error;
    } finally {
      await queryRunner.release();
    }

    // ==========================================
    // 3. CLEANUP CLOUDINARY (Sau khi DB thành công 100%)
    // ==========================================
    // Chỉ chạy sau khi commit thành công để tránh mất ảnh nếu DB rollback
    try {
      const oldImageKeys = oldCampaign.images?.map((img) => img.key).filter(Boolean) || [];
      const oldMainImageKey = oldCampaign.mainImage?.key;

      // Xóa mainImage cũ
      if (mainImage !== undefined && oldMainImageKey) {
        await this.cloudinaryQueue.add(
          'delete-image',
          { publicId: oldMainImageKey },
          { jobId: `delete-${oldMainImageKey}-${Date.now()}` },
        );
      }

      // Xóa cụm danh sách images cũ không còn dùng
      if (images !== undefined) {
        const newKeys = images.map((img) => img.key) || [];
        const imagesToDelete = oldImageKeys.filter((key) => !newKeys.includes(key));
        if (imagesToDelete.length > 0) {
          await this.cloudinaryQueue.add(
            'delete-multiple-images',
            { publicIds: imagesToDelete },
            { jobId: `delete-bulk-${Date.now()}` },
          );
        }
      }
    } catch (cloudError) {
      this.logger.warn(`Database updated but failed to delete some old images from Cloudinary`, cloudError);
    }
  }

  async remove(id: string) {
    const campaign = await this.findOne(id);
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    // 1. Xóa trong DB trước
    await this.campaignRepository.remove(campaign);

    // 2. DB đã sạch sẽ rồi, xóa ảnh
    if (campaign.images) {
      const imageKeys = campaign.images.map((img) => img.key).filter(Boolean);
      if (imageKeys.length > 0) {
        await this.cloudinaryQueue.add(
          'delete-multiple-images',
          { publicIds: imageKeys },
          { jobId: `delete-bulk-${Date.now()}` },
        );
      }
    }

    return true;
  }

  private async removeImagesForError(keys?: string[]) {
    if (!keys || keys.length === 0) return;
    return await this.cloudinaryQueue.add(
      'delete-multiple-images',
      { publicIds: keys },
      { jobId: `delete-bulk-${Date.now()}` },
    );
  }

  private async signUrl(data: CampaignEntity[]): Promise<CampaignEntity[]> {
    return await Promise.all(
      data.map(async (cam) => {
        const imageKeys = cam.images || [];
        const mainImageKey = cam.mainImage?.key;
        const mainImageUrl = await this.cloudinaryService.generateUrl(mainImageKey);
        const images = await this.cloudinaryService.generateUrls(imageKeys);
        const mktImageUrl = await this.cloudinaryService.generateUrl(cam.marketingProgram?.mainImage?.key || '');

        return {
          ...cam,
          marketingProgram: {
            ...cam.marketingProgram,
            mainImage: {
              ...cam.marketingProgram?.mainImage,
              url: mktImageUrl,
            },
          },
          images: images,
          mainImage: {
            ...cam.mainImage,
            url: mainImageUrl,
          },
        } as CampaignEntity;
      }),
    );
  }
}
