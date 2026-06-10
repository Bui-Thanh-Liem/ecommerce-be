import { stringToSlug } from '@/utils/string-to-slug.util';
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, Repository } from 'typeorm';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandEntity } from './entities/brand.entity';
import { BrandQueryDto } from './dto/query-brand.dto';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BrandsService {
  private readonly logger = new Logger(BrandsService.name);

  constructor(
    @InjectRepository(BrandEntity)
    private brandRepo: Repository<BrandEntity>,
    private readonly cloudinaryService: CloudinaryService,
    private dataSource: DataSource,

    @InjectQueue('cloudinary')
    private readonly cloudinaryQueue: Queue,
  ) {}

  async create(createBrandDto: CreateBrandDto) {
    const { name, ...rest } = createBrandDto;
    const code = this.generateBrandCode(name);
    const slug = stringToSlug(name);

    try {
      // Kiểm tra tên brand đã tồn tại chưa
      const existingBrand = await this.brandRepo.exists({ where: { slug } });
      if (existingBrand) {
        throw new ConflictException('Brand with this name already exists');
      }

      // Tạo brand mới
      const brand = this.brandRepo.create({
        ...rest,
        slug,
        name,
        code,
      });
      return await this.brandRepo.save(brand);
    } catch (error) {
      await this.removeImageForError(createBrandDto.image?.key);
      this.logger.debug(`Failed to create brand`, error);
      throw error;
    }
  }

  async findAll(query: BrandQueryDto): Promise<IMetadata<BrandEntity>> {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    //
    const queryBuilder = this.brandRepo
      .createQueryBuilder('brand')

      // Select các trường cụ thể (tương đương với select của bạn)
      .select(['brand.id', 'brand.name', 'brand.image', 'brand.country', 'brand.code', 'brand.createdAt']);

    // Phân trang và sắp xếp
    queryBuilder.skip(skip).take(take).orderBy('brand.createdAt', 'DESC');

    //
    const [data, total] = await queryBuilder.getManyAndCount();

    // Chuyển đổi URL ảnh nếu có
    const dataWithUrls = await Promise.all(
      data.map(async (brand) => {
        if (brand.image && brand.image.key) {
          brand.image.url = await this.cloudinaryService.generateUrl(brand.image.key);
        }
        return brand;
      }),
    );

    return {
      data: dataWithUrls,
      totalData: total,
      page,
      totalPage: Math.ceil(total / limit),
    };
  }

  async findOptions(query: BrandQueryDto): Promise<IMetadata<BrandEntity>> {
    const { page, limit } = query;
    const { take, skip } = calculatePagination(page, limit);

    const queryBuilder = this.brandRepo
      .createQueryBuilder('brand')
      .select(['brand.id', 'brand.name', 'brand.image', 'brand.slug'])
      .skip(skip)
      .take(take)
      .orderBy('brand.createdAt', 'DESC');

    const [data, totalData] = await queryBuilder.getManyAndCount();

    const dataWithUrls = await Promise.all(
      data.map(async (brand) => {
        if (brand.image && brand.image.key) {
          brand.image.url = await this.cloudinaryService.generateUrl(brand.image.key);
        }
        return brand;
      }),
    );

    return {
      data: dataWithUrls,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async exists(ids: string[]) {
    const brands = await this.brandRepo.find({ where: { id: In(ids) } });
    return brands.length === ids.length;
  }

  async findCodeById(id: string) {
    const brand = await this.brandRepo.findOne({ where: { id }, select: ['code'] });
    return brand?.code;
  }

  async findOne(id: string) {
    const brand = await this.brandRepo.findOne({ where: { id } });

    if (brand && brand.image && brand.image.key) {
      brand.image.url = await this.cloudinaryService.generateUrl(brand.image.key);
    }
    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    const { name, image, ...rest } = updateBrandDto;

    // ==========================================
    // 1. VALIDATION & READS (Ngoài Transaction để giải phóng DB nhanh)
    // ==========================================

    // Lấy dữ liệu cũ để check tồn tại và giữ lại key ảnh cũ phục vụ dọn dẹp bộ nhớ
    const oldBrand = await this.brandRepo.findOne({
      where: { id },
      select: { id: true, name: true, slug: true, image: true },
    });
    if (!oldBrand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    const slug = name ? stringToSlug(name) : undefined;

    // Chạy song song các câu lệnh check độc lập ngoài transaction
    const [isSlugDup] = await Promise.all([
      name ? this.brandRepo.exists({ where: { slug, id: Not(id) } }) : Promise.resolve(false),
    ]);

    if (isSlugDup) {
      throw new ConflictException('Brand with this name already exists');
    }

    // Ghi nhận key ảnh cũ trước khi ghi đè
    const oldImageKey = oldBrand.image?.key;

    // ==========================================
    // 2. TRANSACTION (Chỉ bọc các hành động ghi - WRITE)
    // ==========================================
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Merge dữ liệu mới vào thực thể cũ
      const updatedBrand = this.brandRepo.merge(oldBrand, {
        ...rest,
        ...(name && { name, slug, code: this.generateBrandCode(name) }),
      });

      if (image !== undefined) {
        updatedBrand.image = image; // Hoặc kiểu dữ liệu Entity tương ứng của bạn
      }

      // Lưu vào DB qua transaction manager
      await queryRunner.manager.save(BrandEntity, updatedBrand);

      // Chỉ commit khi DB hoàn tất
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Nếu DB lỗi, dọn dẹp ảnh MỚI vừa được truyền lên từ Dto để tránh rác Cloudinary
      if (image?.key) {
        await this.removeImageForError(image.key).catch((err) =>
          this.logger.error(`Failed to cleanup new brand image on error`, err),
        );
      }

      this.logger.error(`Failed to update brand with ID ${id}`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }

    // ==========================================
    // 3. CLEANUP CLOUDINARY (Sau khi DB thành công 100%)
    // ==========================================
    try {
      // Chỉ tiến hành xóa ảnh cũ nếu có truyền ảnh mới lên và ảnh cũ thực sự tồn tại và khác ảnh mới
      if (image !== undefined && oldImageKey && image.key !== oldImageKey) {
        await this.cloudinaryQueue.add(
          'delete-image',
          { publicId: oldImageKey },
          { jobId: `delete-${oldImageKey}-${Date.now()}` },
        );
      }
    } catch (cloudError) {
      this.logger.warn(`Database updated but failed to delete old brand image from Cloudinary`, cloudError);
    }
  }

  async remove(id: string) {
    const brand = await this.brandRepo.findOneBy({ id });
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    // 1. Xóa trong DB trước
    await this.brandRepo.remove(brand);

    // 2. DB đã sạch sẽ rồi, xóa ảnh
    if (brand.image && brand.image.key) {
      await this.cloudinaryQueue.add(
        'delete-image',
        { publicId: brand.image.key },
        { jobId: `delete-${brand.image.key}-${Date.now()}` },
      );
    }

    return true;
  }

  private generateBrandCode(name: string): string {
    if (!name) throw new BadRequestException('Name is required !');
    return name.slice(0, 3).toUpperCase();
  }

  private async removeImageForError(key?: string) {
    if (!key) return;
    return await this.cloudinaryQueue.add('delete-image', { publicId: key }, { jobId: `delete-${key}-${Date.now()}` });
  }
}
