import { Injectable, InternalServerErrorException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffEntity } from './entities/staff.entity';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { StoresService } from '../stores/stores.service';

@Injectable()
export class StaffsService implements OnModuleInit {
  constructor(
    @InjectRepository(StaffEntity)
    private staffRepo: Repository<StaffEntity>,

    private readonly storesService: StoresService,

    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.initializeAdminUser();
  }

  async create(createStaffDto: CreateStaffDto) {
    const { store: storeId } = createStaffDto;

    // Nếu có storeId, tìm kiếm store
    if (storeId) {
      const store = await this.storesService.exists(storeId);
      if (!store) {
        throw new NotFoundException(`Store with ID ${storeId} not found`);
      }
    }

    // Tạo mới staff với store nếu có
    const staff = this.staffRepo.create({ ...createStaffDto, store: storeId ? { id: storeId } : null });
    return await this.staffRepo.save(staff);
  }

  async findByEmail(email: string) {
    return await this.staffRepo.findOneBy({ email });
  }

  findAll({ page, limit, email }: { page: string; limit: string; email?: string }) {
    return this.staffRepo.find({
      where: email ? { email } : {},
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
    });
  }

  async findOne(id: string) {
    if (!id) return null;
    return await this.staffRepo.findOneBy({ id });
  }

  async update(id: string, updateStaffDto: UpdateStaffDto) {
    const { store: storeId, ...rest } = updateStaffDto;

    // Nếu có storeId, tìm kiếm store
    if (storeId) {
      const store = await this.storesService.exists(storeId);
      if (!store) {
        throw new NotFoundException(`Store with ID ${storeId} not found`);
      }
    }

    // Cập nhật staff với store nếu có
    const staff = await this.staffRepo.preload({ id, ...rest, store: storeId ? { id: storeId } : null });
    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }

    try {
      return await this.staffRepo.save(staff);
    } catch (error) {
      // Xử lý lỗi khác nếu cần
      throw new InternalServerErrorException('Error updating location region', (error as Error).message);
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
      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(adminPassword, salt);

      //
      const adminStaff = this.staffRepo.create({
        isAdmin: true,
        email: adminEmail,
        phone: adminPhone,
        fullName: adminFullName,
        password: hashPassword,
      });
      await this.staffRepo.save(adminStaff);

      console.log('Admin staff created with email:', adminStaff.email);
    } else {
      console.log('Admin staff already exists with email:', adminEmail);
    }
  }
}
