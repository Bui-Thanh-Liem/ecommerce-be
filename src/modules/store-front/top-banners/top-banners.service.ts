import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateTopBannerDto } from './dto/create-top-banner.dto';
import { UpdateTopBannerDto } from './dto/update-top-banner.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TopBannerEntity } from './entities/top-banner.entity';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { stringToSlug } from '@/utils/string-to-slug.util';
import { TopBannerQueryDto } from './dto/query-top-banner.dto';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { calculatePagination } from '@/utils/pagination-calculator.util';

@Injectable()
export class TopBannersService {
  private readonly logger = new Logger(TopBannersService.name);

  constructor(
    @InjectRepository(TopBannerEntity)
    private topBannerRepo: Repository<TopBannerEntity>,

    private readonly cloudinaryService: CloudinaryService,

    private dataSource: DataSource,

    @InjectQueue('cloudinary')
    private readonly cloudinaryQueue: Queue,
  ) {}

  async create(dto: CreateTopBannerDto) {
    try {
      const { title, ...rest } = dto;
      const slug = stringToSlug(title);

      // Kiểm tra tên top banner đã tồn tại chưa
      const existingTopBanner = await this.topBannerRepo.exists({ where: { slug } });
      if (existingTopBanner) {
        throw new ConflictException('Top banner with this title already exists');
      }

      const topBanner = this.topBannerRepo.create({
        ...rest,
        slug,
        title,
      });
      return this.topBannerRepo.save(topBanner);
    } catch (error) {
      await this.removeImageForError(dto.image?.key);
      this.logger.error(`Failed to create top banner`, error);
      throw error;
    }
  }

  async findAll(query: TopBannerQueryDto): Promise<IMetadata<TopBannerEntity>> {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    //
    const queryBuilder = this.topBannerRepo
      .createQueryBuilder('topBanner')

      // Select các trường cụ thể (tương đương với select của bạn)
      .select([
        'topBanner.id',
        'topBanner.title',
        'topBanner.slug',
        'topBanner.desc',
        'topBanner.image',
        'topBanner.isActive',
        'topBanner.createdAt',
      ]);

    // Phân trang và sắp xếp
    queryBuilder.orderBy('topBanner.createdAt', 'DESC').skip(skip).take(take);

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

  async findOptions(query: TopBannerQueryDto): Promise<IMetadata<TopBannerEntity>> {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    //
    const queryBuilder = this.topBannerRepo
      .createQueryBuilder('topBanner')

      // Select các trường cụ thể (tương đương với select của bạn)
      .select([
        'topBanner.id',
        'topBanner.title',
        'topBanner.slug',
        'topBanner.desc',
        'topBanner.image',
        'topBanner.isActive',
        'topBanner.createdAt',
      ]);

    // Phân trang và sắp xếp
    queryBuilder.orderBy('topBanner.createdAt', 'DESC').skip(skip).take(take);

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
    const topBanner = await this.topBannerRepo.findOne({
      where: { id },
    });

    if (topBanner?.image && topBanner.image.key) {
      topBanner.image.url = await this.cloudinaryService.generateUrl(topBanner.image.key);
    }

    return topBanner;
  }

  async update(id: string, dto: UpdateTopBannerDto) {
    const { title, image, ...rest } = dto;

    // ==========================================
    // 1. VALIDATION & READS (Ngoài Transaction để giải phóng DB nhanh)
    // ==========================================

    // Lấy dữ liệu cũ để check tồn tại và giữ lại thông tin ảnh cũ
    const oldTopBanner = await this.topBannerRepo.findOne({
      where: { id },
      select: { id: true, title: true, slug: true, image: true },
    });
    if (!oldTopBanner) {
      throw new NotFoundException('Top banner not found');
    }

    // Nếu có đổi title, cần check trùng slug với các top banner khác (trừ chính nó)
    const slug = title ? stringToSlug(title) : undefined;
    if (slug && slug !== oldTopBanner.slug) {
      const existingTopBanner = await this.topBannerRepo.exists({ where: { slug, id: Not(id) } });
      if (existingTopBanner) {
        throw new ConflictException('Top banner with this title already exists');
      }
    }

    // Ghi nhận key ảnh cũ phục vụ việc xóa sau khi commit thành công
    const oldImageKey = oldTopBanner.image?.key;

    // ==========================================
    // 2. TRANSACTION (Chỉ bọc các hành động ghi - WRITE)
    // ==========================================
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Merge dữ liệu mới vào thực thể cũ
      const updatedTopBanner = this.topBannerRepo.merge(oldTopBanner, {
        ...rest,
        ...(title && { title, slug }),
      });

      if (image !== undefined) {
        updatedTopBanner.image = image; // Hoặc kiểu dữ liệu Entity tương ứng của bạn
      }

      // Lưu vào DB qua transaction manager
      await queryRunner.manager.save(TopBannerEntity, updatedTopBanner);

      // Chỉ commit khi DB hoàn tất
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Nếu DB lỗi, dọn dẹp ảnh MỚI vừa được truyền lên từ Dto để tránh rác Cloudinary
      if (image?.key) {
        await this.removeImageForError(image.key).catch((err) =>
          this.logger.error(`Failed to cleanup new top banner image on error`, err),
        );
      }

      this.logger.error(`Failed to update top banner with ID ${id}`, error);
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
      this.logger.warn(`Database updated but failed to delete old top banner image from Cloudinary`, cloudError);
    }
  }

  async remove(id: string) {
    const topBanner = await this.topBannerRepo.findOneBy({ id });
    if (!topBanner) {
      throw new NotFoundException(`Top banner with ID ${id} not found`);
    }

    // 1. Xóa trong DB trước
    await this.topBannerRepo.remove(topBanner);

    // 2. DB đã sạch sẽ rồi, xóa ảnh
    if (topBanner.image && topBanner.image.key) {
      await this.cloudinaryQueue.add(
        'delete-image',
        { publicId: topBanner.image.key },
        { jobId: `delete-${topBanner.image.key}-${Date.now()}` },
      );
    }

    return true;
  }

  async findForConfig() {
    const banner = await this.topBannerRepo.findOne({
      where: { image: Not(IsNull()) },
      order: { createdAt: 'DESC' },
      select: { id: true, title: true, image: true },
    });

    if (!banner) {
      throw new NotFoundException('No top banner found for config');
    }

    const signedBanners = await this.signUrl([banner]);

    return signedBanners[0];
  }

  async signUrl(banners: TopBannerEntity[]): Promise<TopBannerEntity[]> {
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
