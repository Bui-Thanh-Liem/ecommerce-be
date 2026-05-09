import { forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
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
    const {
      country,
      provinceCity,
      districtTown,
      wardCommune,
      manager: managerId,
      name,
      address,
      ...rest
    } = createStoreDto;

    //
    const existingStore = await this.storeRepo.exists({ where: [{ name }] });
    if (existingStore) {
      throw new NotFoundException('Store with the same name');
    }

    //
    const isManagerAssigned = await this.storeRepo.exists({
      where: { manager: { id: managerId } },
    });
    if (isManagerAssigned) {
      throw new NotFoundException('Manager is already assigned to another store');
    }

    // Tìm kiếm các region
    const [countryExists, provinceExists, districtExists, wardExists, managerExists] = await Promise.all([
      this.locationService.exists(country),
      this.locationService.exists(provinceCity),
      this.locationService.exists(districtTown),
      this.locationService.exists(wardCommune),
      this.staffService.exists([managerId]),
    ]);

    if (!countryExists || !provinceExists || !districtExists || !wardExists) {
      throw new NotFoundException('One or more location regions not found');
    }

    if (!managerExists) {
      throw new NotFoundException('Manager not found');
    }

    // Tạo mới store với các region nếu có
    const store = this.storeRepo.create({
      ...rest,
      name,
      address,
      country: { id: country },
      provinceCity: { id: provinceCity },
      districtTown: { id: districtTown },
      wardCommune: { id: wardCommune },
      manager: { id: managerId },
    });

    const savedStore = await this.storeRepo.save(store);

    // Cập nhật lại thông tin store cho manager
    await this.staffService.updateAfterStoreCreate(managerId, savedStore.id);

    return savedStore;
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

  async existsNotManager(ids: string[]): Promise<boolean> {
    const count = await this.storeRepo.countBy({ id: In(ids), manager: IsNull() });
    return count === ids.length;
  }

  async update(id: string, updateStoreDto: UpdateStoreDto) {
    const { country, provinceCity, districtTown, wardCommune, manager: managerId, ...rest } = updateStoreDto;

    // Tìm kiếm locationRegion
    if (country) {
      const countryExists = await this.locationService.exists(country);
      if (!countryExists) {
        throw new NotFoundException('Country not found');
      }
    }

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
      country: country ? { id: country } : undefined,
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
