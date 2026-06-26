import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateMainBannerDto } from './dto/create-main-banner.dto';
import { UpdateMainBannerDto } from './dto/update-main-banner.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { MainBannerEntity } from './entities/main-banner.entity';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MainBannerQueryDto } from './dto/query-main-banner.dto';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { CampaignsService } from '@/modules/marketing-program/campaigns/campaigns.service';

@Injectable()
export class MainBannerService {
  private readonly logger = new Logger(MainBannerService.name);

  constructor(
    @InjectRepository(MainBannerEntity)
    private mainBannerRepo: Repository<MainBannerEntity>,

    private readonly cloudinaryService: CloudinaryService,

    private readonly campaignService: CampaignsService,

    private dataSource: DataSource,

    @InjectQueue('cloudinary')
    private readonly cloudinaryQueue: Queue,
  ) {}

  async create(createMainBannerDto: CreateMainBannerDto) {
    try {
      const { campaign: campaignId, ...rest } = createMainBannerDto;

      // Kiểm tra tên main banner đã tồn tại chưa
      const campaignSlug = await this.campaignService.findSlugById(campaignId);
      if (!campaignSlug) {
        throw new NotFoundException('Campaign not found');
      }

      const mainBanner = this.mainBannerRepo.create({
        ...rest,
        campaignSlug,
        campaign: { id: campaignId },
      });

      return this.mainBannerRepo.save(mainBanner);
    } catch (error) {
      await this.removeImageForError(createMainBannerDto.image?.key);
      this.logger.error(`Failed to create main banner`, error);
      throw error;
    }
  }

  async findAll(query: MainBannerQueryDto): Promise<IMetadata<MainBannerEntity>> {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    //
    const queryBuilder = this.mainBannerRepo
      .createQueryBuilder('mainBanner')
      .leftJoinAndSelect('mainBanner.campaign', 'campaign')

      // Select các trường cụ thể (tương đương với select của bạn)
      .select([
        'mainBanner.id',
        'mainBanner.desc',
        'mainBanner.image',
        'mainBanner.isActive',
        'mainBanner.createdAt',
        'mainBanner.campaignSlug',

        'campaign.id',
        'campaign.name',
        'campaign.slug',
      ]);

    // Phân trang và sắp xếp
    queryBuilder.orderBy('mainBanner.createdAt', 'DESC').skip(skip).take(take);

    //
    const [data, total] = await queryBuilder.getManyAndCount();

    // Chuyển đổi URL ảnh nếu có
    const dataWithUrls = await this.signUrl(data);

    return {
      data: dataWithUrls,
      totalData: total,
      page,
      totalPage: Math.ceil(total / limit),
    };
  }

  async findOptions(query: MainBannerQueryDto): Promise<IMetadata<MainBannerEntity>> {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    //
    const queryBuilder = this.mainBannerRepo
      .createQueryBuilder('mainBanner')
      .leftJoinAndSelect('mainBanner.campaign', 'campaign')

      // Select các trường cụ thể (tương đương với select của bạn)
      .select([
        'mainBanner.id',
        'mainBanner.desc',
        'mainBanner.image',
        'mainBanner.isActive',
        'mainBanner.createdAt',
        'mainBanner.campaignSlug',

        'campaign.id',
        'campaign.name',
        'campaign.slug',
      ]);

    // Phân trang và sắp xếp
    queryBuilder.orderBy('mainBanner.createdAt', 'DESC').skip(skip).take(take);

    //
    const [data, total] = await queryBuilder.getManyAndCount();

    // Chuyển đổi URL ảnh nếu có
    const dataWithUrls = await this.signUrl(data);

    return {
      data: dataWithUrls,
      totalData: total,
      page,
      totalPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const mainBanner = await this.mainBannerRepo.findOne({
      where: { id },
    });

    if (mainBanner?.image && mainBanner.image.key) {
      mainBanner.image.url = await this.cloudinaryService.generateUrl(mainBanner.image.key);
    }

    return mainBanner;
  }

  async update(id: string, updateMainBannerDto: UpdateMainBannerDto) {
    const { campaign: campaignId, image, ...rest } = updateMainBannerDto;

    // ==========================================
    // 1. VALIDATION & READS (Ngoài Transaction để giải phóng DB nhanh)
    // ==========================================

    // Lấy dữ liệu cũ để check tồn tại và giữ lại thông tin ảnh cũ
    const [oldMainBanner, campaignSlug] = await Promise.all([
      this.mainBannerRepo.findOne({
        where: { id },
        select: { id: true, image: true },
      }),
      campaignId ? this.campaignService.findSlugById(campaignId) : null,
    ]);
    if (!oldMainBanner) throw new NotFoundException('Main banner not found');

    if (campaignId && !campaignSlug) throw new NotFoundException('Campaign not found');

    // Ghi nhận key ảnh cũ phục vụ việc xóa sau khi commit thành công
    const oldImageKey = oldMainBanner.image?.key;

    // ==========================================
    // 2. TRANSACTION (Chỉ bọc các hành động ghi - WRITE)
    // ==========================================
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Merge dữ liệu mới vào thực thể cũ
      const updatedMainBanner = this.mainBannerRepo.merge(oldMainBanner, {
        ...rest,
        ...(campaignSlug ? { campaignSlug } : {}),
        ...(campaignId ? { campaign: { id: campaignId } } : {}),
      });

      if (image !== undefined) {
        updatedMainBanner.image = image; // Hoặc kiểu dữ liệu Entity tương ứng của bạn
      }

      // Lưu vào DB qua transaction manager
      await queryRunner.manager.save(MainBannerEntity, updatedMainBanner);

      // Chỉ commit khi DB hoàn tất
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Nếu DB lỗi, dọn dẹp ảnh MỚI vừa được truyền lên từ Dto để tránh rác Cloudinary
      if (image?.key) {
        await this.removeImageForError(image.key).catch((err) =>
          this.logger.error(`Failed to cleanup new main banner image on error`, err),
        );
      }

      this.logger.error(`Failed to update main banner with ID ${id}`, error);
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
        await this.cloudinaryQueue.add(
          'delete-image',
          { publicId: oldImageKey },
          { jobId: `delete-${oldImageKey}-${Date.now()}` },
        );
      }
    } catch (cloudError) {
      this.logger.warn(`Database updated but failed to delete old main banner image from Cloudinary`, cloudError);
    }
  }

  async remove(id: string) {
    const mainBanner = await this.mainBannerRepo.findOneBy({ id });
    if (!mainBanner) {
      throw new NotFoundException(`Main banner with ID ${id} not found`);
    }

    // 1. Xóa trong DB trước
    await this.mainBannerRepo.remove(mainBanner);

    // 2. DB đã sạch sẽ rồi, xóa ảnh
    if (mainBanner.image && mainBanner.image.key) {
      await this.cloudinaryQueue.add(
        'delete-image',
        { publicId: mainBanner.image.key },
        { jobId: `delete-${mainBanner.image.key}-${Date.now()}` },
      );
    }

    return true;
  }

  async signUrl(banners: MainBannerEntity[]): Promise<MainBannerEntity[]> {
    return await Promise.all(
      banners.map(async (banner) => {
        if (banner.image && banner.image.key) {
          banner.image.url = await this.cloudinaryService.generateUrl(banner.image.key);
        }
        return banner;
      }),
    );
  }

  private async removeImageForError(key?: string) {
    if (!key) return;
    return await this.cloudinaryQueue.add('delete-image', { publicId: key }, { jobId: `delete-${key}-${Date.now()}` });
  }
}
