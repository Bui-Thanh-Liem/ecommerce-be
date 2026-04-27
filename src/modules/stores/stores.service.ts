import { forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LocationRegionsService } from '../location-regions/location-regions.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreEntity } from './entities/store.entity';
import { StaffsService } from '../staffs/staffs.service';

@Injectable()
export class StoresService {
  private readonly logger = new Logger(StoresService.name);

  constructor(
    @InjectRepository(StoreEntity)
    private storeRepo: Repository<StoreEntity>,

    private readonly locationService: LocationRegionsService,

    @Inject(forwardRef(() => StaffsService))
    private readonly staffService: StaffsService,
  ) {}

  async create(createStoreDto: CreateStoreDto) {
    const { provinceCity, districtTown, wardCommune, manager: managerId, ...rest } = createStoreDto;

    // Tìm kiếm các region
    const [provinceExists, districtExists, wardExists, managerExists] = await Promise.all([
      this.locationService.exists(provinceCity),
      this.locationService.exists(districtTown),
      this.locationService.exists(wardCommune),
      this.staffService.exists([managerId]),
    ]);

    if (!provinceExists || !districtExists || !wardExists) {
      throw new NotFoundException('One or more location regions not found');
    }

    if (!managerExists) {
      throw new NotFoundException('Manager not found');
    }

    // Tạo mới store với các region nếu có
    const store = this.storeRepo.create({
      ...rest,
      provinceCity: { id: provinceCity },
      districtTown: { id: districtTown },
      wardCommune: { id: wardCommune },
      manager: { id: managerId },
    });

    return await this.storeRepo.save(store);
  }

  async findAll() {
    return await this.storeRepo.find({
      relations: ['provinceCity', 'districtTown', 'wardCommune', 'manager'],
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
        manager: { id: true, fullName: true },
      },
    });
  }

  async findOne(id: string) {
    return await this.storeRepo.findOne({
      where: { id },
      relations: ['provinceCity', 'districtTown', 'wardCommune', 'manager'],
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
        manager: { id: true, fullName: true },
      },
    });
  }

  async exists(ids: string[]): Promise<boolean> {
    const count = await this.storeRepo.countBy({ id: In(ids) });
    return count === ids.length;
  }

  async update(id: string, updateStoreDto: UpdateStoreDto) {
    const { provinceCity, districtTown, wardCommune, manager: managerId, ...rest } = updateStoreDto;

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

    if (managerId) {
      const managerExists = await this.staffService.exists([managerId]);
      if (!managerExists) {
        throw new NotFoundException('Manager not found');
      }
    }

    const store = await this.storeRepo.preload({
      id,
      ...rest,
      provinceCity: provinceCity ? { id: provinceCity } : undefined,
      districtTown: districtTown ? { id: districtTown } : undefined,
      wardCommune: wardCommune ? { id: wardCommune } : undefined,
      manager: managerId ? { id: managerId } : undefined,
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
