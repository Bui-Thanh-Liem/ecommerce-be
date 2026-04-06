import { stringToSlug } from '@/utils/string-to-slug.util';
import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandEntity } from './entities/brand.entity';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(BrandEntity)
    private brandRepo: Repository<BrandEntity>,
  ) {}

  async create(createBrandDto: CreateBrandDto) {
    const { name, ...rest } = createBrandDto;
    const slug = stringToSlug(name);

    // Kiểm tra tên brand đã tồn tại chưa
    const existingBrand = await this.brandRepo.exists({ where: { slug } });
    if (existingBrand) {
      throw new ConflictException('Brand with this name already exists');
    }

    const brand = this.brandRepo.create({
      ...rest,
      slug,
      name,
    });
    return await this.brandRepo.save(brand);
  }

  async findAll() {
    return await this.brandRepo.find();
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

    //
    const brand = await this.brandRepo.preload({ id, ...rest, name, slug: name ? stringToSlug(name) : undefined });
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
}
