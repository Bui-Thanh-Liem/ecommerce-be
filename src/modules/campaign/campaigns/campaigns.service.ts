import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { IMetadata } from '@/shared/interfaces/metadata.interface';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { stringToSlug } from '@/utils/string-to-slug.util';
import {
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

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    @InjectRepository(CampaignEntity)
    private campaignRepository: Repository<CampaignEntity>,

    @Inject(forwardRef(() => PromotionsService))
    private readonly promotionService: PromotionsService,

    private readonly cloudinaryService: CloudinaryService,

    private dataSource: DataSource,
  ) {}

  async create(createCampaignDto: CreateCampaignDto) {
    try {
      const { promotions: promotionIds, name, startDate, endDate, ...rest } = createCampaignDto;

      //
      if (startDate >= endDate) {
        throw new NotFoundException('Start date must be before end date');
      }

      //
      const slug = stringToSlug(name);
      const existingCampaign = await this.campaignRepository.exists({ where: { slug } });
      if (existingCampaign) {
        throw new NotFoundException('A campaign with the same name already exists');
      }

      //
      if (promotionIds && promotionIds?.length > 0) {
        const promotionsExist = await this.promotionService.exists(promotionIds);
        if (!promotionsExist) {
          throw new NotFoundException(`One or more Promotion IDs not found: ${promotionIds.join(', ')}`);
        }
      }

      const campaign = this.campaignRepository.create({
        ...rest,
        name,
        slug,
        startDate,
        endDate,
        promotions: promotionIds?.map((id) => ({ id })) || [],
      });
      return await this.campaignRepository.save(campaign);
    } catch (error) {
      const keys = [...(createCampaignDto?.images?.map((img) => img.key) || []), createCampaignDto?.mainImage.key];
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

        'promotions.id',
      ])

      // Phân trang và sắp xếp
      .skip(skip)
      .take(take)
      .orderBy('campaign.createdAt', 'DESC'); // Nên có orderBy khi phân trang

    const [data, totalData] = await queryBuilder.getManyAndCount();

    //
    const dataWithUrls = data.map(async (cam) => {
      const imageKeys = cam.images || [];
      const mainImageKey = cam.mainImage?.key;
      const mainImageUrl = await this.cloudinaryService.generateUrl(mainImageKey);
      const images = await this.cloudinaryService.generateUrls(imageKeys);

      return {
        ...cam,
        images: images,
        mainImage: {
          ...cam.mainImage,
          url: mainImageUrl,
        },
      } as CampaignEntity;
    });

    return {
      data: await Promise.all(dataWithUrls),
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async findOne(id: string) {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['promotions'],
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

  async update(id: string, updateCampaignDto: UpdateCampaignDto) {
    const { promotions: promotionIds, name, startDate, endDate, images, mainImage, ...rest } = updateCampaignDto;

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

    // Chạy song song các câu lệnh check độc lập
    const [isSlugDup, isPromoValid] = await Promise.all([
      name ? this.campaignRepository.exists({ where: { slug, id: Not(id) } }) : Promise.resolve(false),
      hasPromotions ? this.promotionService.exists(promotionIds) : Promise.resolve(true),
    ]);

    if (isSlugDup) throw new ConflictException('A campaign with the same name already exists');
    if (!isPromoValid) throw new BadRequestException(`One or more Promotion IDs not found`);

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
        ...(promotionIds && { promotions: promotionIds.map((pId) => ({ id: pId })) }),
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
        await this.cloudinaryService.deleteImage(oldMainImageKey);
      }

      // Xóa cụm danh sách images cũ không còn dùng
      if (images !== undefined) {
        const newKeys = images.map((img) => img.key) || [];
        const imagesToDelete = oldImageKeys.filter((key) => !newKeys.includes(key));
        if (imagesToDelete.length > 0) {
          await this.cloudinaryService.deleteMultipleImages(imagesToDelete);
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
        await this.cloudinaryService.deleteMultipleImages(imageKeys);
      }
    }

    return true;
  }

  private async removeImagesForError(keys?: string[]) {
    if (!keys || keys.length === 0) return;
    return await this.cloudinaryService.deleteMultipleImages(keys);
  }
}
