import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateLocationRegionDto } from './dto/create-location-region.dto';
import { UpdateLocationRegionDto } from './dto/update-location-region.dto';
import { LocationRegionEntity } from './entities/location-region.entity';

@Injectable()
export class LocationRegionsService {
  constructor(
    @InjectRepository(LocationRegionEntity)
    private locationRegionRepo: Repository<LocationRegionEntity>,
  ) {}

  async create(createLocationRegionDto: CreateLocationRegionDto) {
    //
    const { parent: parentId, name } = createLocationRegionDto;

    //
    const existingRegion = await this.locationRegionRepo.findOneBy({ name });
    if (existingRegion) {
      throw new ConflictException(`Location region with name "${name}" already exists`);
    }

    // Nếu có parentId, tìm kiếm parent region
    if (parentId) {
      const parent = await this.locationRegionRepo.exists({
        where: { id: parentId },
      });
      if (!parent) {
        throw new NotFoundException(`Parent region with ID ${parentId} not found`);
      }
    }

    // Tạo mới region với parent nếu có
    const locationRegion = this.locationRegionRepo.create({
      ...createLocationRegionDto,
      parent: parentId ? { id: parentId } : null,
    });
    return await this.locationRegionRepo.save(locationRegion);
  }

  async findAll() {
    return await this.locationRegionRepo.find({ relations: ['parent', 'children'] });
  }

  async exists(id: string): Promise<boolean> {
    return await this.locationRegionRepo.exists({ where: { id } });
  }

  async findOne(id: string) {
    const locationRegion = await this.locationRegionRepo.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!locationRegion) {
      throw new NotFoundException(`Location region with ID ${id} not found`);
    }
    return locationRegion;
  }

  async update(id: string, updateLocationRegionDto: UpdateLocationRegionDto) {
    const { name, parent: parentId, ...rest } = updateLocationRegionDto;

    // 0. Kiểm tra nếu có name thì phải unique
    if (name) {
      const existingCategory = await this.locationRegionRepo.exists({
        where: { name, id: Not(id) },
      });
      if (existingCategory) {
        throw new ConflictException('Another location region with this name already exists');
      }
    }

    // 1. Chặn lỗi logic: Không được phép chọn chính mình làm cha (circular reference)
    if (parentId && parentId === id) {
      throw new BadRequestException('A location region cannot be its own parent');
    }

    // 2. Kiểm tra Parent có tồn tại không (nếu có update parent)
    if (parentId) {
      const parentExists = await this.locationRegionRepo.exists({ where: { id: parentId } });
      if (!parentExists) {
        throw new NotFoundException(`Parent region with ID ${parentId} not found`);
      }
    }

    // 3. Gán thủ công để đảm bảo TypeORM hiểu đây là quan hệ Entity, không phải String
    const locationRegion = await this.locationRegionRepo.preload({
      id,
      name,
      ...rest,
      parent: parentId ? { id: parentId } : undefined,
    });

    if (!locationRegion) {
      throw new NotFoundException(`Location region with ID ${id} not found`);
    }

    // 4. Lưu và trả về dữ liệu đã update
    try {
      return await this.locationRegionRepo.save(locationRegion);
    } catch (error) {
      // Xử lý lỗi khác nếu cần
      throw new InternalServerErrorException('Error updating location region', (error as Error).message);
    }
  }

  async remove(id: string) {
    const locationRegion = await this.locationRegionRepo.findOne({ where: { id } });
    if (!locationRegion) {
      throw new NotFoundException(`Location region with ID ${id} not found`);
    }
    return await this.locationRegionRepo.remove(locationRegion);
  }
}
