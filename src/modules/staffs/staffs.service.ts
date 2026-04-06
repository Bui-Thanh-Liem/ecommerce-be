import { Injectable, InternalServerErrorException, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { InjectRepository } from '@nestjs/typeorm';
import { genSalt, hash } from 'bcrypt';
import { In, Repository } from 'typeorm';
import { StoresService } from '../stores/stores.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffEntity } from './entities/staff.entity';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class StaffsService implements OnModuleInit {
  private readonly logger = new Logger(StaffsService.name);

  constructor(
    @InjectRepository(StaffEntity)
    private staffRepo: Repository<StaffEntity>,

    private readonly storesService: StoresService,

    private readonly configService: ConfigService,

    private readonly rolesService: RolesService,
  ) {}

  async onModuleInit() {
    await this.initializeAdminUser();
  }

  async create(createStaffDto: CreateStaffDto) {
    const { store: storeId, roles: roleIds, password, ...rest } = createStaffDto;

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

    // Hash password trước khi lưu vào database
    const salt = await genSalt();
    const hashPassword = await hash(password, salt);

    // Tạo mới staff với store nếu có
    const staff = this.staffRepo.create({
      ...rest,
      password: hashPassword,
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

  async findAll({ page, limit, email }: { page: string; limit: string; email?: string }) {
    return await this.staffRepo.find({
      where: email ? { email } : {},
      relations: { store: true, roles: { permissions: true } },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        isActive: true,
        isAdmin: true,
        store: { id: true, name: true },
        roles: { id: true, name: true, permissions: { id: true, name: true, code: true } },
      },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
    });
  }

  async exists(ids: string[]): Promise<boolean> {
    const count = await this.staffRepo.countBy({ id: In(ids) });
    return count === ids.length;
  }

  async findOne(id: string) {
    if (!id) return null;
    return await this.staffRepo.findOne({
      where: { id },
      relations: { store: true, roles: { permissions: true } },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        isActive: true,
        isAdmin: true,
        store: { id: true, name: true },
        roles: { id: true, name: true, permissions: { id: true, name: true, code: true } },
      },
    });
  }

  async update(id: string, updateStaffDto: UpdateStaffDto) {
    const { store: storeId, roles: roleIds, ...rest } = updateStaffDto;

    // Nếu có storeId, tìm kiếm store
    if (storeId) {
      this.logger.debug('typeof :::', typeof storeId);
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

    // Cập nhật staff với store nếu có
    const staff = await this.staffRepo.preload({
      id,
      ...rest,
      store: storeId ? { id: storeId } : undefined,
      roles: roleIds ? roleIds.map((id) => ({ id })) : [],
    });
    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }

    try {
      return await this.staffRepo.save(staff);
    } catch (error) {
      // Xử lý lỗi khác nếu cần
      throw new InternalServerErrorException('Error updating staff', (error as Error).message);
    }
  }

  async remove(id: string) {
    const staff = await this.staffRepo.findOneBy({ id });

    if (!staff) {
      return null;
    }

    // await this.staffRepo.delete(id); // command SQL
    return await this.staffRepo.remove(staff);
  }

  private async initializeAdminUser() {
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
        isAdmin: true,
        email: adminEmail,
        phone: adminPhone,
        fullName: adminFullName,
        password: hashPassword,
      });
      await this.staffRepo.save(adminStaff);

      this.logger.debug('Admin staff created with email:', adminStaff.email);
    } else {
      this.logger.debug('Admin staff already exists with email:', adminEmail);
    }
  }
}
