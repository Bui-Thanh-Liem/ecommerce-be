import { ConflictException, forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Not, Repository } from 'typeorm';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreEntity } from './entities/store.entity';
import { StoreQueryDto } from './dto/query-store.dto';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { LocationRegionsService } from '../location-regions/location-regions.service';
import { StaffsService } from '@/modules/management/staffs/staffs.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class StoresService {
  private readonly logger = new Logger(StoresService.name);

  constructor(
    @InjectRepository(StoreEntity)
    private storeRepo: Repository<StoreEntity>,

    private readonly locationService: LocationRegionsService,

    @Inject(forwardRef(() => StaffsService))
    private readonly staffService: StaffsService,
    private dataSource: DataSource,

    private readonly cloudinaryService: CloudinaryService,

    @InjectQueue('cloudinary')
    private readonly cloudinaryQueue: Queue,
  ) {}

  async create(createStoreDto: CreateStoreDto) {
    try {
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

      // 1. Kiểm tra trùng tên store và trùng manager
      const [eS, eM] = await Promise.all([
        this.storeRepo.exists({ where: [{ name }] }),
        this.storeRepo.exists({
          where: { manager: { id: managerId } },
        }),
      ]);
      if (eS) throw new ConflictException('Store with the same name');
      if (eM) throw new ConflictException('Manager is already assigned to another store');

      // 2. Tìm kiếm các region
      const [countryExists, provinceExists, districtExists, wardExists, managerExists] = await Promise.all([
        this.locationService.exists([country]),
        this.locationService.exists([provinceCity]),
        this.locationService.exists([districtTown]),
        this.locationService.exists([wardCommune]),
        this.staffService.exists([managerId]),
      ]);

      if (!countryExists || !provinceExists || !districtExists || !wardExists) {
        throw new NotFoundException('One or more location regions not found');
      }

      if (!managerExists) throw new NotFoundException('Manager not found');

      // 3. Tạo mới store với các region nếu có
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

      // 4. Cập nhật lại thông tin store cho manager
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
    const dataWithUrls = await Promise.all(
      data.map(async (store) => {
        if (store.image) {
          store.image = await this.cloudinaryService.generateImage(store.image);
        }
        return store;
      }),
    );

    return {
      data: dataWithUrls,
      totalData: total,
      page,
      totalPage: Math.ceil(total / limit),
    };
  }

  async findOptions(query: StoreQueryDto): Promise<IMetadata<StoreEntity>> {
    const { page, limit } = query;
    const { take, skip } = calculatePagination(page, limit);

    const queryBuilder = this.storeRepo
      .createQueryBuilder('store')
      .select(['store.id', 'store.name', 'store.image'])
      .skip(skip)
      .take(take)
      .orderBy('store.createdAt', 'DESC');

    const [data, totalData] = await queryBuilder.getManyAndCount();

    // Chuyển đổi URL ảnh nếu có
    const dataWithUrls = await Promise.all(
      data.map(async (store) => {
        if (store.image) {
          store.image = await this.cloudinaryService.generateImage(store.image);
        }
        return store;
      }),
    );

    return {
      data: dataWithUrls,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
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
    const {
      country,
      provinceCity,
      districtTown,
      wardCommune,
      manager: managerId,
      image,
      name,
      ...rest
    } = updateStoreDto;

    // ==========================================
    // 1. VALIDATION & READS (Ngoài Transaction để giải phóng DB nhanh)
    // ==========================================

    // Lấy dữ liệu cũ để check tồn tại và giữ lại thông tin ảnh cũ
    const oldStore = await this.storeRepo.findOne({
      where: { id },
      select: { id: true, name: true, image: true },
    });
    if (!oldStore) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    // Chạy song song các câu lệnh check độc lập ngoài transaction
    const [eN, eC, ePC, eDT, eWC, eM] = await Promise.all([
      name ? this.storeRepo.exists({ where: { name, id: Not(id) } }) : null,
      country ? this.locationService.exists([country]) : null,
      provinceCity ? this.locationService.exists([provinceCity]) : null,
      districtTown ? this.locationService.exists([districtTown]) : null,
      wardCommune ? this.locationService.exists([wardCommune]) : null,
      managerId ? this.staffService.exists([managerId]) : null,
    ]);

    // Check trùng tên (Sửa lỗi logic !eN thành eN và đổi sang đúng ConflictException)
    if (eN) throw new ConflictException('Store with this name already exists');

    // Check tồn tại các khóa ngoại
    if (country && !eC) throw new NotFoundException('Country not found');
    if (provinceCity && !ePC) throw new NotFoundException('Province not found');
    if (districtTown && !eDT) throw new NotFoundException('District not found');
    if (wardCommune && !eWC) throw new NotFoundException('Ward not found');
    if (managerId && !eM) throw new NotFoundException('Manager not found');

    // Ghi nhận key ảnh cũ trước khi bị ghi đè
    const oldImageKey = oldStore.image?.key;

    // ==========================================
    // 2. TRANSACTION (Chỉ bọc các hành động ghi - WRITE)
    // ==========================================
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Merge dữ liệu mới vào thực thể cũ
      const updatedStore = this.storeRepo.merge(oldStore, {
        ...rest,
        ...(name && { name }),
        manager: managerId ? { id: managerId } : undefined,
        wardCommune: wardCommune ? { id: wardCommune } : undefined,
        districtTown: districtTown ? { id: districtTown } : undefined,
        provinceCity: provinceCity ? { id: provinceCity } : undefined,
        // (Nếu Dto có truyền country thì mapping vào entity tương ứng của bạn, ở đây mình giữ nguyên theo rest nếu có)
      });

      if (image !== undefined) {
        updatedStore.image = image; // Hoặc kiểu dữ liệu Entity tương ứng của bạn
      }

      // Lưu vào DB qua transaction manager
      await queryRunner.manager.save(StoreEntity, updatedStore);

      // Chỉ commit khi DB hoàn tất
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Nếu DB lỗi, dọn dẹp ảnh MỚI vừa được truyền lên từ Dto để tránh rác Cloudinary
      if (image?.key) {
        await this.removeImageForError(image.key).catch((err) =>
          this.logger.error(`Failed to cleanup new store image on error`, err),
        );
      }

      this.logger.error(`Failed to update store with ID ${id}`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }

    // ==========================================
    // 3. CLEANUP CLOUDINARY (Sau khi DB thành công 100%)
    // ==========================================
    try {
      // Chỉ tiến hành xóa ảnh cũ nếu có truyền ảnh mới, ảnh cũ thực sự tồn tại và khác ảnh mới
      if (image !== undefined && oldImageKey && image.key !== oldImageKey) {
        await this.cloudinaryQueue.add(
          'delete-image',
          { publicId: oldImageKey },
          { jobId: `delete-${oldImageKey}-${Date.now()}` },
        );
      }
    } catch (cloudError) {
      this.logger.warn(`Database updated but failed to delete old store image from Cloudinary`, cloudError);
    }
  }

  async remove(id: string) {
    const store = await this.storeRepo.findOneBy({ id });
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    // 1. Xóa trong DB trước
    await this.storeRepo.remove(store);

    // 2. DB đã sạch sẽ rồi, xóa ảnh
    if (store.image && store.image.key) {
      await this.cloudinaryQueue.add(
        'delete-image',
        { publicId: store.image.key },
        { jobId: `delete-${store.image.key}-${Date.now()}` },
      );
    }

    return true;
  }

  private async removeImageForError(key?: string) {
    if (!key) return;
    return await this.cloudinaryQueue.add('delete-image', { publicId: key }, { jobId: `delete-${key}-${Date.now()}` });
  }
}
