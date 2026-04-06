import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { StoreEntity } from './entities/store.entity';
import { LocationRegionsService } from '../location-regions/location-regions.service';

@Injectable()
export class StoresService {
  private readonly logger = new Logger(StoresService.name);

  constructor(
    @InjectRepository(StoreEntity)
    private storeRepo: Repository<StoreEntity>,
    private readonly locationService: LocationRegionsService,
  ) {}

  async create(createStoreDto: CreateStoreDto) {
    const { locationRegion, ...rest } = createStoreDto;

    // Tìm kiếm locationRegion
    if (locationRegion) {
      const locationRegionExists = await this.locationService.exists(locationRegion);
      if (!locationRegionExists) {
        throw new NotFoundException(`Location region with ID ${locationRegion} not found`);
      }
    }

    // Tạo mới store với locationRegion nếu có
    const store = this.storeRepo.create({
      ...rest,
      locationRegion: { id: locationRegion },
    });
    return await this.storeRepo.save(store);
  }

  async findAll() {
    return await this.storeRepo.find({
      relations: ['locationRegion'],
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
        locationRegion: { id: true, name: true },
      },
    });
  }

  async findOne(id: string) {
    return await this.storeRepo.findOne({
      where: { id },
      relations: ['locationRegion'],
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
        locationRegion: { id: true, name: true },
      },
    });
  }

  async exists(ids: string[]): Promise<boolean> {
    const count = await this.storeRepo.countBy({ id: In(ids) });
    return count === ids.length;
  }

  async update(id: string, updateStoreDto: UpdateStoreDto) {
    const { locationRegion, ...rest } = updateStoreDto;

    // Tìm kiếm locationRegion
    if (locationRegion) {
      const locationRegionExists = await this.locationService.exists(locationRegion);
      if (!locationRegionExists) {
        throw new NotFoundException(`Location region with ID ${locationRegion} not found`);
      }
    }

    const store = await this.storeRepo.preload({
      id,
      ...rest,
      locationRegion: locationRegion ? { id: locationRegion } : undefined,
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
