import { ConflictException, forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { LocationRegionsService } from '../location-regions/location-regions.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreEntity } from './entities/store.entity';
import { StaffsService } from '../staffs/staffs.service';
import { StoreQueryDto } from './dto/query-store.dto';
import { IMetadata } from '@/shared/interfaces/metadata.interface';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { CloudinaryService } from '@/cloud-storage/cloudinary/cloudinary.service';

@Injectable()
export class StoresService {
  private readonly logger = new Logger(StoresService.name);

  constructor(
    @InjectRepository(StoreEntity)
    private storeRepo: Repository<StoreEntity>,

    private readonly locationService: LocationRegionsService,

    @Inject(forwardRef(() => StaffsService))
    private readonly staffService: StaffsService,

    private readonly cloudinaryService: CloudinaryService,
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

    try {
      //
      const existingStore = await this.storeRepo.exists({ where: [{ name }] });
      if (existingStore) {
        throw new ConflictException('Store with the same name');
      }

      //
      const isManagerAssigned = await this.storeRepo.exists({
        where: { manager: { id: managerId } },
      });
      if (isManagerAssigned) {
        throw new ConflictException('Manager is already assigned to another store');
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
    } catch (error) {
      await this.removeImageForError(createStoreDto.image?.key);
      this.logger.debug(`Failed to create store`, error);
      throw error;
    }
  }

  async findAll(query: StoreQueryDto): Promise<IMetadata<StoreEntity>> {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    //
    const builder = this.storeRepo
      .createQueryBuilder('store')

      // Join các quan hệ
      .leftJoinAndSelect('store.country', 'country')
      .leftJoinAndSelect('store.provinceCity', 'provinceCity')
      .leftJoinAndSelect('store.districtTown', 'districtTown')
      .leftJoinAndSelect('store.wardCommune', 'wardCommune')
      .leftJoinAndSelect('store.manager', 'manager');

    // Select các trường cụ thể (tương đương với select của bạn)
    builder
      .select([
        'store.id',
        'store.name',
        'store.phone',
        'store.image',
        'store.address',
        'store.openingHours',
        'store.closingHours',
        'store.lat',
        'store.lng',
        'store.isActive',
        'store.createdAt',
        'country.id',
        'country.name',
        'provinceCity.id',
        'provinceCity.name',
        'districtTown.id',
        'districtTown.name',
        'wardCommune.id',
        'wardCommune.name',
        'manager.id',
        'manager.fullName',
      ])

      // Phân trang và sắp xếp
      .skip(skip)
      .take(take)
      .orderBy('store.createdAt', 'DESC'); // Nên có orderBy khi phân trang

    const [data, total] = await builder.take(take).skip(skip).getManyAndCount();

    // Chuyển đổi URL ảnh nếu có
    data.forEach((store) => {
      if (store.image && store.image.key) {
        store.image.url = this.cloudinaryService.generateUrl(store.image.key);
      }
    });

    return {
      data,
      totalData: total,
      page,
      totalPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    return await this.storeRepo.findOne({
      where: { id },
      relations: ['country', 'provinceCity', 'districtTown', 'wardCommune', 'manager'],
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
        country: { id: true, name: true },
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
    const { country, provinceCity, districtTown, wardCommune, manager: managerId, image, ...rest } = updateStoreDto;

    try {
      // 1. Kiểm tra xem store có tồn tại không
      const oldStore = await this.storeRepo.findOneBy({ id });
      if (!oldStore) {
        throw new NotFoundException(`Store with ID ${id} not found`);
      }

      // 2. Nếu có cập nhật manager, kiểm tra xem manager đó có tồn tại không và chưa được gán cho store nào khác
      const validationPromises: Promise<void>[] = [];
      if (country) {
        validationPromises.push(
          this.locationService.exists(country).then((ext) => {
            if (!ext) throw new NotFoundException('Country not found');
          }),
        );
      }
      if (provinceCity) {
        validationPromises.push(
          this.locationService.exists(provinceCity).then((ext) => {
            if (!ext) throw new NotFoundException('Province not found');
          }),
        );
      }
      if (districtTown) {
        validationPromises.push(
          this.locationService.exists(districtTown).then((ext) => {
            if (!ext) throw new NotFoundException('District not found');
          }),
        );
      }
      if (wardCommune) {
        validationPromises.push(
          this.locationService.exists(wardCommune).then((ext) => {
            if (!ext) throw new NotFoundException('Ward not found');
          }),
        );
      }
      if (managerId) {
        validationPromises.push(
          this.staffService.exists([managerId]).then((exists) => {
            if (!exists) {
              throw new NotFoundException('Manager not found');
            }
          }),
        );
      }
      await Promise.all(validationPromises);

      // Lưu lại key của ảnh cũ để nếu có cập nhật ảnh mới thì sẽ xóa ảnh cũ sau
      const oldImageKey = oldStore.image?.key;

      // 3. Cập nhật store với các trường mới nếu có
      const updatedStore = this.storeRepo.merge(oldStore, {
        ...rest,
        image: image ? image : undefined,
        manager: managerId ? { id: managerId } : undefined,
        wardCommune: wardCommune ? { id: wardCommune } : undefined,
        districtTown: districtTown ? { id: districtTown } : undefined,
        provinceCity: provinceCity ? { id: provinceCity } : undefined,
      });
      await this.storeRepo.save(updatedStore);

      // 4. Nếu có cập nhật ảnh, xóa ảnh cũ trên Cloudinary
      if (image?.key && oldImageKey && image.key !== oldImageKey) {
        await this.cloudinaryService.deleteImage(oldImageKey);
      }
    } catch (error) {
      await this.removeImageForError(updateStoreDto?.image?.key);
      this.logger.debug(`Failed to update store with ID ${id}`, error);
      throw error;
    }
  }

  async remove(id: string) {
    const store = await this.storeRepo.findOneBy({ id });
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    // 1. Xóa trong DB trước - Chạy mất vài mili-giây, giải phóng DB ngay lập tức
    await this.storeRepo.remove(store);

    // 2. DB đã sạch sẽ rồi, xóa ảnh
    if (store.image && store.image.key) {
      try {
        await this.cloudinaryService.deleteImage(store.image.key);
      } catch (error) {
        // Nếu lỗi cloud ở đây, DB đã xóa xong nên hệ thống KHÔNG bị lỗi hiển thị ảnh chết.
        // Chúng ta chỉ bị thừa 1 cái ảnh rác trên Cloudinary.
        // Log lỗi lại để dùng Cron Job quét rác sau,
        // hoặc ném vào Queue để nó tự động xóa lại (Retry).
        console.error(`Failed to delete image from Cloudinary: ${store.image.key}`, error);
      }
    }

    return true;
  }

  private removeImageForError(key?: string) {
    if (!key) return;
    return this.cloudinaryService.deleteImage(key);
  }
}
