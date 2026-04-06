import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { In, Repository } from 'typeorm';
import { permissionsSeed } from './seeding';

@Injectable()
export class PermissionsService implements OnModuleInit {
  constructor(
    @InjectRepository(PermissionEntity)
    private permissionRepo: Repository<PermissionEntity>,
  ) {}

  async onModuleInit() {
    await this.initPermissions();
  }

  async findAll() {
    return await this.permissionRepo.find();
  }

  async checkExistByIds(ids: string[]) {
    const count = await this.permissionRepo.countBy({ id: In(ids) });
    return count === ids.length;
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.permissionRepo.findOneBy({ id });
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return await this.permissionRepo.update(id, updatePermissionDto);
  }

  async initPermissions() {
    const existingPermissions = await this.permissionRepo.count();
    if (existingPermissions === 0) {
      const permissions = Object.values(permissionsSeed).flatMap((permission) => Object.values(permission));
      await Promise.all(
        permissions.map((permission) =>
          this.permissionRepo.save({
            isActive: true,
            name: permission.name,
            desc: permission.desc,
            code: permission.code,
          }),
        ),
      );
    }
  }
}
