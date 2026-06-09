import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateMainBannerDto } from './dto/create-main-banner.dto';
import { UpdateMainBannerDto } from './dto/update-main-banner.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { MainBannerEntity } from './entities/main-banner.entity';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { stringToSlug } from '@/utils/string-to-slug.util';
import { MainBannerQueryDto } from './dto/query-main-banner.dto';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { calculatePagination } from '@/utils/pagination-calculator.util';

@Injectable()
export class MainBannerService {
  private readonly logger = new Logger(MainBannerService.name);

  constructor(
    @InjectRepository(MainBannerEntity)
    private mainBannerRepo: Repository<MainBannerEntity>,
    private readonly cloudinaryService: CloudinaryService,
    private dataSource: DataSource,
    @InjectQueue('cloudinary')
    private readonly cloudinaryQueue: Queue,
  ) {}

  async create(createMainBannerDto: CreateMainBannerDto) {
    try {
      const { title, ...rest } = createMainBannerDto;
      const slug = stringToSlug(title);

      // Kiểm tra tên main banner đã tồn tại chưa
      const existingMainBanner = await this.mainBannerRepo.exists({ where: { slug } });
      if (existingMainBanner) {
        throw new ConflictException('Main banner with this title already exists');
      }

      const mainBanner = this.mainBannerRepo.create({
        ...rest,
        slug,
        title,
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

      // Select các trường cụ thể (tương đương với select của bạn)
      .select([
        'mainBanner.id',
        'mainBanner.title',
        'mainBanner.slug',
        'mainBanner.desc',
        'mainBanner.image',
        'mainBanner.createdAt',
      ]);

    // Phân trang và sắp xếp
    queryBuilder.orderBy('mainBanner.createdAt', 'DESC').skip(skip).take(take);

    //
    const [data, total] = await queryBuilder.getManyAndCount();

    // Chuyển đổi URL ảnh nếu có
    const dataWithUrls = await Promise.all(
      data.map(async (category) => {
        if (category.image && category.image.key) {
          category.image.url = await this.cloudinaryService.generateUrl(category.image.key);
        }
        return category;
      }),
    );

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
    const { title, image, ...rest } = updateMainBannerDto;

    // ==========================================
    // 1. VALIDATION & READS (Ngoài Transaction để giải phóng DB nhanh)
    // ==========================================

    // Lấy dữ liệu cũ để check tồn tại và giữ lại thông tin ảnh cũ
    const oldMainBanner = await this.mainBannerRepo.findOne({
      where: { id },
      select: { id: true, title: true, slug: true, image: true },
    });
    if (!oldMainBanner) {
      throw new NotFoundException(`Main banner with ID ${id} not found`);
    }

    const slug = title ? stringToSlug(title) : undefined;

    // Chạy song song các câu lệnh check độc lập ngoài transaction
    const [isSlugDup] = await Promise.all([
      title ? this.mainBannerRepo.exists({ where: { slug, id: Not(id) } }) : Promise.resolve(false),
    ]);

    if (isSlugDup) {
      throw new ConflictException('Main banner with this title already exists');
    }

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
        ...(title && { title, slug }),
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

  private async removeImageForError(key?: string) {
    if (!key) return;
    return await this.cloudinaryQueue.add('delete-image', { publicId: key }, { jobId: `delete-${key}-${Date.now()}` });
  }
}
