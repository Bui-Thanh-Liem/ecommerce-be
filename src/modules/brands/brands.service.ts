import { stringToSlug } from '@/utils/string-to-slug.util';
import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandEntity } from './entities/brand.entity';
import { BrandQueryDto } from './dto/query-brand.dto';
import { IMetadata } from '@/shared/interfaces/metadata.interface';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { CloudinaryService } from '@/cloud-storage/cloudinary/cloudinary.service';

@Injectable()
export class BrandsService {
  private readonly logger = new Logger(BrandsService.name);

  constructor(
    @InjectRepository(BrandEntity)
    private brandRepo: Repository<BrandEntity>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createBrandDto: CreateBrandDto) {
    const { name, ...rest } = createBrandDto;
    const code = this.generateBrandCode(name);
    const slug = stringToSlug(name);

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
    data.forEach((brand) => {
      if (brand.image && brand.image.key) {
        brand.image.url = this.cloudinaryService.generateUrl(brand.image.key);
      }
    });

    return {
      data,
      totalData: total,
      page,
      totalPage: Math.ceil(total / limit),
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
    return await this.brandRepo.findOne({ where: { id } });
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    const { name, image, ...rest } = updateBrandDto;

    // 1. Kiểm tra brand tồn tại chưa
    const oldBrand = await this.brandRepo.findOneBy({ id });
    if (!oldBrand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    // 2. Nếu có cập nhật tên, cần kiểm tra trùng tên
    if (name) {
      const slug = stringToSlug(name);
      const existingBrand = await this.brandRepo.findOne({ where: { slug, id: Not(id) } });
      if (existingBrand) {
        throw new ConflictException('Brand with this name already exists');
      }
    }

    // Lưu lại key của ảnh cũ để nếu có cập nhật ảnh mới thì sẽ xóa ảnh cũ sau
    const oldImageKey = oldBrand.image?.key;

    try {
      // 3. Cập nhật brand
      const updatedBrand = this.brandRepo.merge(oldBrand, {
        ...rest,
        name: name ? name : undefined,
        image: image ? image : undefined,
        slug: name ? stringToSlug(name) : undefined,
        code: name ? this.generateBrandCode(name) : undefined,
      });
      await this.brandRepo.save(updatedBrand);

      // 4. Nếu có cập nhật ảnh, xóa ảnh cũ trên Cloudinary
      if (image?.key && oldImageKey && image.key !== oldImageKey) {
        await this.cloudinaryService.deleteImage(oldImageKey);
      }
    } catch (error) {
      this.logger.debug(`Failed to update brand with ID ${id}`, error);
      throw new NotFoundException(`Failed to update brand with ID ${id}`);
    }
  }

  async remove(id: string) {
    const brand = await this.brandRepo.findOneBy({ id });
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    // 1. Xóa trong DB trước - Chạy mất vài mili-giây, giải phóng DB ngay lập tức
    await this.brandRepo.remove(brand);

    // 2. DB đã sạch sẽ rồi, xóa ảnh
    if (brand.image && brand.image.key) {
      try {
        await this.cloudinaryService.deleteImage(brand.image.key);
      } catch (error) {
        // Nếu lỗi cloud ở đây, DB đã xóa xong nên hệ thống KHÔNG bị lỗi hiển thị ảnh chết.
        // Chúng ta chỉ bị thừa 1 cái ảnh rác trên Cloudinary.
        // Log lỗi lại để dùng Cron Job quét rác sau,
        // hoặc ném vào Queue để nó tự động xóa lại (Retry).
        console.error(`Failed to delete image from Cloudinary: ${brand.image.key}`, error);
      }
    }

    return true;
  }

  private generateBrandCode(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .substring(0, 10) // Lấy 10 ký tự đầu tiên
      .toLocaleUpperCase(); // Loại bỏ dấu => chỉ còn chữ cái
  }
}
