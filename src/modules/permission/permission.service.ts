import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { SEED_PERMISSIONS } from './seeder';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepo: Repository<Permission>,
  ) {
    this.seedPermissions().catch((err) => {
      throw new InternalServerErrorException('Failed to seed permissions', err);
    });
  }

  async seedPermissions() {
    const permissions = Object.values(SEED_PERMISSIONS);
    for (const permData of permissions) {
      const existing = await this.permissionRepo.findOne({
        where: {
          code: permData.code,
        },
      });

      if (!existing) {
        const perm = this.permissionRepo.create(permData);
        await this.permissionRepo.save(perm);
      }
    }
  }

  async findByIds(ids: string[]): Promise<Permission[]> {
    return this.permissionRepo.find({
      where: {
        id: In(ids),
      },
    });
  }

  async findAll(): Promise<Permission[]> {
    return await this.permissionRepo
      .createQueryBuilder('permission')
      // 2. Sử dụng hàm MySQL CAST() để chuyển cột 'code' thành số
      //    SIGNED: Chuyển thành số nguyên có dấu
      .orderBy('CAST(permission.code AS SIGNED)', 'ASC')
      // 3. Thực thi truy vấn và lấy kết quả
      .getMany();
  }
}
