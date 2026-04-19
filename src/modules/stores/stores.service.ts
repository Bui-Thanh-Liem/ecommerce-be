import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LocationRegionsService } from '../location-regions/location-regions.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreEntity } from './entities/store.entity';

@Injectable()
export class StoresService {
  private readonly logger = new Logger(StoresService.name);

  constructor(
    @InjectRepository(StoreEntity)
    private storeRepo: Repository<StoreEntity>,
    private readonly locationService: LocationRegionsService,
  ) {}

  async create(createStoreDto: CreateStoreDto) {
    const { provinceCity, districtTown, wardCommune, ...rest } = createStoreDto;

    // Tìm kiếm các region
    const [provinceExists, districtExists, wardExists] = await Promise.all([
      this.locationService.exists(provinceCity),
      this.locationService.exists(districtTown),
      this.locationService.exists(wardCommune),
    ]);

    if (!provinceExists || !districtExists || !wardExists) {
      throw new NotFoundException('One or more location regions not found');
    }

    // Tạo mới store với các region nếu có
    const store = this.storeRepo.create({
      ...rest,
      provinceCity: { id: provinceCity },
      districtTown: { id: districtTown },
      wardCommune: { id: wardCommune },
    });

    return await this.storeRepo.save(store);
  }

  async findAll() {
    return await this.storeRepo.find({
      relations: ['provinceCity', 'districtTown', 'wardCommune'],
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        openingHours: true,
        closingHours: true,
        lat: true,
        lng: true,
        isActive: true,
        provinceCity: { id: true, name: true },
        districtTown: { id: true, name: true },
        wardCommune: { id: true, name: true },
      },
    });
  }

  async findOne(id: string) {
    return await this.storeRepo.findOne({
      where: { id },
      relations: ['provinceCity', 'districtTown', 'wardCommune'],
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        openingHours: true,
        closingHours: true,
        lat: true,
        lng: true,
        isActive: true,
        provinceCity: { id: true, name: true },
        districtTown: { id: true, name: true },
        wardCommune: { id: true, name: true },
      },
    });
  }

  async exists(ids: string[]): Promise<boolean> {
    const count = await this.storeRepo.countBy({ id: In(ids) });
    return count === ids.length;
  }

  async update(id: string, updateStoreDto: UpdateStoreDto) {
    const { provinceCity, districtTown, wardCommune, ...rest } = updateStoreDto;

    // Tìm kiếm locationRegion
    if (provinceCity) {
      const provinceExists = await this.locationService.exists(provinceCity);
      if (!provinceExists) {
        throw new NotFoundException('Province not found');
      }
    }

    if (districtTown) {
      const districtExists = await this.locationService.exists(districtTown);
      if (!districtExists) {
        throw new NotFoundException('District not found');
      }
    }

    if (wardCommune) {
      const wardExists = await this.locationService.exists(wardCommune);
      if (!wardExists) {
        throw new NotFoundException('Ward not found');
      }
    }

    const store = await this.storeRepo.preload({
      id,
      ...rest,
      provinceCity: provinceCity ? { id: provinceCity } : undefined,
      districtTown: districtTown ? { id: districtTown } : undefined,
      wardCommune: wardCommune ? { id: wardCommune } : undefined,
    });
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    try {
      return await this.storeRepo.save(store);
    } catch (error) {
      this.logger.debug(`Failed to update store with ID ${id}`, error);
      throw new NotFoundException(`Failed to update store with ID ${id}`);
    }
  }

  async remove(id: string) {
    const store = await this.storeRepo.findOneBy({ id });
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }
    return await this.storeRepo.remove(store);
  }
}
