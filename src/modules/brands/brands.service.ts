import { stringToSlug } from '@/utils/string-to-slug.util';
import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandEntity } from './entities/brand.entity';
import { BrandQueryDto } from './dto/query-brand.dto';
import { IMetadata } from '@/shared/interfaces/metadata.interface';
import { calculatePagination } from '@/utils/pagination-calculator.util';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(BrandEntity)
    private brandRepo: Repository<BrandEntity>,
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
      .select(['brand.id', 'brand.name', 'brand.logoUrl', 'brand.country', 'brand.code', 'brand.createdAt']);

    // Phân trang và sắp xếp
    queryBuilder.skip(skip).take(take).orderBy('brand.createdAt', 'DESC');

    //
    const [data, total] = await queryBuilder.getManyAndCount();

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
    const { name, ...rest } = updateBrandDto;

    // Nếu có cập nhật tên, cần kiểm tra trùng tên
    if (name) {
      const slug = stringToSlug(name);
      const existingBrand = await this.brandRepo.findOne({ where: { slug, id: Not(id) } });
      if (existingBrand) {
        throw new ConflictException('Brand with this name already exists');
      }
    }

    // Tạo brand mới
    const brand = await this.brandRepo.preload({
      id,
      ...rest,
      name,
      slug: name ? stringToSlug(name) : undefined,
      code: name ? this.generateBrandCode(name) : undefined,
    });
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    try {
      return await this.brandRepo.save(brand);
    } catch (error) {
      // Xử lý lỗi khác nếu cần
      throw new InternalServerErrorException('Error updating brand', (error as Error).message);
    }
  }

  async remove(id: string) {
    const brand = await this.brandRepo.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    return await this.brandRepo.remove(brand);
  }

  private generateBrandCode(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .substring(0, 10) // Lấy 10 ký tự đầu tiên
      .toLocaleUpperCase(); // Loại bỏ dấu => chỉ còn chữ cái
  }
}
