import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { InjectRepository } from '@nestjs/typeorm';
import { genSalt, hash } from 'bcrypt';
import { In, Repository } from 'typeorm';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffEntity } from './entities/staff.entity';
import { RolesService } from '../roles/roles.service';
import { StaffWorkLocationID } from '@/shared/enums/staff-work-location-id.enum';
import { StaffQueryDto } from './dto/query-staff.dto';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { StoresService } from '@/modules/inventory/stores/stores.service';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';

@Injectable()
export class StaffsService implements OnModuleInit {
  private readonly logger = new Logger(StaffsService.name);

  constructor(
    @InjectRepository(StaffEntity)
    private staffRepo: Repository<StaffEntity>,

    @Inject(forwardRef(() => StoresService))
    private readonly storesService: StoresService,

    private readonly configService: ConfigService,

    private readonly rolesService: RolesService,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async onModuleInit() {
    await this.initializeData();
  }

  async create(createStaffDto: CreateStaffDto) {
    const { store: storeId, roles: roleIds, directManager: directManagerId, password, ...rest } = createStaffDto;

    //
    const [existingStaffByEmail, existingStaffByPhone] = await Promise.all([
      this.staffRepo.exists({ where: { email: createStaffDto.email } }),
      this.staffRepo.exists({ where: { phone: createStaffDto.phone } }),
    ]);

    if (existingStaffByEmail) {
      throw new BadRequestException('Staff with this email already exists');
    }

    if (existingStaffByPhone) {
      throw new BadRequestException('Staff with this phone already exists');
    }

    // Nếu có storeId, tìm kiếm store
    if (storeId) {
      const store = await this.storesService.exists([storeId]);
      if (!store) {
        throw new NotFoundException(`Store with ID ${storeId} not found`);
      }
    }

    // Nếu có roles, kiểm tra từng roleId có tồn tại hay không (có thể thêm logic này nếu cần)
    if (roleIds) {
      const store = await this.rolesService.exists(roleIds);
      if (!store) {
        throw new NotFoundException(`Roles with IDs ${roleIds.join(', ')} not found`);
      }
    }

    // Nếu có directManagerId, tìm kiếm nhân viên quản lý
    const directManager = await this.exists([directManagerId]);
    if (!directManager) {
      throw new NotFoundException(`Direct manager with ID ${directManagerId} not found`);
    }

    // Hash password trước khi lưu vào database
    const salt = await genSalt();
    const hashPassword = await hash(password, salt);

    // Tạo mới staff với store nếu có
    const staff = this.staffRepo.create({
      ...rest,
      password: hashPassword,
      managedStore: undefined, // Mặc định khi tạo staff mới sẽ không gán managedStore, khi tạo store mới sẽ cập nhật
      directManager: { id: directManagerId },
      store: storeId ? { id: storeId } : null,
      roles: roleIds ? roleIds.map((id) => ({ id })) : [],
    });
    return await this.staffRepo.save(staff);
  }

  async findByEmail(email: string) {
    return await this.staffRepo.findOneBy({ email });
  }

  async findByPhone(phone: string) {
    return await this.staffRepo.findOneBy({ phone });
  }

  async findAll(query: StaffQueryDto): Promise<IMetadata<StaffEntity>> {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    //
    const queryBuilder = this.staffRepo
      .createQueryBuilder('staff')

      // Join các quan hệ
      .leftJoinAndSelect('staff.store', 'store')
      .leftJoinAndSelect('staff.directManager', 'directManager')
      .leftJoinAndSelect('staff.roles', 'roles')
      .leftJoinAndSelect('roles.permissions', 'permissions')

      // Select các trường cụ thể (tương đương với select của bạn)
      .select([
        'staff.id',
        'staff.fullName',
        'staff.avatar',
        'staff.phone',
        'staff.email',
        'staff.isActive',
        'staff.isSuperAdmin',
        'staff.workLocationID',
        'staff.isStoreAdmin',
        'staff.isSubAdmin',
        'staff.createdAt',
        'store.id',
        'store.name',
        'directManager.id',
        'directManager.fullName',
        'roles.id',
        'roles.name',
        'permissions.id',
        'permissions.name',
        'permissions.code',
      ])

      // Phân trang và sắp xếp
      .skip(skip)
      .take(take)
      .orderBy('staff.createdAt', 'DESC'); // Nên có orderBy khi phân trang

    const [data, totalData] = await queryBuilder.getManyAndCount();

    // Chuyển đổi URL ảnh nếu có
    const dataWithUrls = await Promise.all(
      data.map(async (staff) => {
        if (staff.avatar && staff.avatar.key) {
          staff.avatar.url = await this.cloudinaryService.generateUrl(staff.avatar.key);
        }
        return staff;
      }),
    );

    return {
      data: dataWithUrls,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async findOptions(query: StaffQueryDto): Promise<IMetadata<StaffEntity>> {
    const { page, limit } = query;
    const { take, skip } = calculatePagination(page, limit);

    const queryBuilder = this.staffRepo
      .createQueryBuilder('staff')
      .select(['staff.id', 'staff.fullName'])
      .skip(skip)
      .take(take)
      .orderBy('staff.createdAt', 'DESC');

    const [data, totalData] = await queryBuilder.getManyAndCount();

    return {
      data,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async exists(ids: string[]): Promise<boolean> {
    const count = await this.staffRepo.countBy({ id: In(ids) });
    return count === ids.length;
  }

  async findOne(id?: string) {
    if (!id) return null;
    return await this.staffRepo.findOne({
      where: { id },
      relations: { store: true, roles: { permissions: true }, directManager: true },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        isActive: true,
        isSuperAdmin: true,
        isStoreAdmin: true,
        isSubAdmin: true,
        store: { id: true, name: true },
        directManager: { id: true, fullName: true },
        roles: { id: true, name: true, permissions: { id: true, name: true, code: true } },
      },
    });
  }

  async update(id: string, updateStaffDto: UpdateStaffDto, currentStaff: StaffEntity, targetStaff: StaffEntity) {
    const { store: storeId, roles: roleIds, directManager: directManagerId, ...rest } = updateStaffDto;

    // Ngăn không cho nhân viên tự hủy kích hoạt tài khoản của chính mình
    if (rest.isActive === false && currentStaff.id === id) {
      throw new BadRequestException('You cannot deactivate yourself');
    }

    if (id === directManagerId) {
      throw new BadRequestException('A staff cannot be their own direct manager');
    }

    // Nếu có storeId, tìm kiếm store
    if (storeId) {
      const store = await this.storesService.exists([storeId]);
      if (!store) {
        throw new NotFoundException(`Store with ID ${storeId} not found`);
      }
    }

    // Nếu có roles, kiểm tra từng roleId có tồn tại hay không (có thể thêm logic này nếu cần)
    if (roleIds) {
      const store = await this.rolesService.exists(roleIds);
      if (!store) {
        throw new NotFoundException(`Roles with IDs ${roleIds.join(', ')} not found`);
      }
    }

    // Nếu có directManagerId, tìm kiếm nhân viên quản lý
    if (directManagerId) {
      const directManager = await this.exists([directManagerId]);
      if (!directManager) {
        throw new NotFoundException(`Direct manager with ID ${directManagerId} not found`);
      }
    }

    // Cập nhật staff (không dùng preload, dùng merge do đã query ở SuperAdminGuard)
    this.staffRepo.merge(targetStaff, {
      ...rest,
      managedStore: undefined, // Mặc định khi cập nhật staff sẽ không gán managedStore, khi tạo store mới sẽ cập nhật
      store: storeId ? { id: storeId } : undefined,
      roles: roleIds ? roleIds.map((id) => ({ id })) : undefined,
      directManager: directManagerId ? { id: directManagerId } : undefined,
    });

    try {
      return await this.staffRepo.save(targetStaff);
    } catch (error) {
      // Xử lý lỗi khác nếu cần
      throw new BadRequestException('Error updating staff', (error as Error).message);
    }
  }

  /**
   *
   * @param staffId
   * @param storeId
   * @desc Đã kiểm tra tồn tại staff và store tại storeService rồi.
   */
  async updateAfterStoreCreate(staffId: string, storeId: string) {
    await this.staffRepo.save({
      id: staffId,
      isStoreAdmin: true,
      store: { id: storeId },
      managedStore: { id: storeId },
    });
  }

  async remove(id: string, currentStaff: StaffEntity, targetStaff: StaffEntity) {
    // Ngăn không cho nhân viên tự xóa tài khoản của chính mình
    if (currentStaff.id === id) {
      throw new BadRequestException('You cannot delete yourself');
    }

    // await this.staffRepo.delete(id); // command SQL
    return await this.staffRepo.remove(targetStaff); // TypeOrm
  }

  private async initializeData() {
    // Admin user details
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || '';
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD') || '';
    const adminPhone = this.configService.get<string>('ADMIN_PHONE') || '';
    const adminFullName = this.configService.get<string>('ADMIN_FULL_NAME') || '';

    // Check if the admin user already exists
    const staff = await this.findByEmail(adminEmail);
    if (!staff) {
      //
      const salt = await genSalt();
      const hashPassword = await hash(adminPassword, salt);

      //
      const adminStaff = this.staffRepo.create({
        email: adminEmail,
        phone: adminPhone,
        isSuperAdmin: true,
        isSubAdmin: false,
        isStoreAdmin: false,
        password: hashPassword,
        fullName: adminFullName,
        workLocationID: StaffWorkLocationID.HEADQUARTERS,
      });
      await this.staffRepo.save(adminStaff);

      this.logger.debug('Admin staff created with email:', adminStaff.email);
    } else {
      this.logger.debug('Admin staff already exists with email:', adminEmail);
    }
  }
}
