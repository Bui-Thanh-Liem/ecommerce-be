import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionEntity } from './entities/permission.entity';
import { permissionsSeed } from './seeding';

@Injectable()
export class PermissionsService implements OnModuleInit {
  constructor(
    @InjectRepository(PermissionEntity)
    private permissionRepo: Repository<PermissionEntity>,
  ) {}

  async onModuleInit() {
    await this.initializeData();
  }

  async findAll() {
    return await this.permissionRepo.find();
  }

  async checkExistByIds(ids: string[]) {
    const count = await this.permissionRepo.countBy({ id: In(ids) });
    return count === ids.length;
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    if (updatePermissionDto.name) {
      const existing = await this.permissionRepo.exists({ where: { name: updatePermissionDto.name, id: Not(id) } });
      if (existing) {
        throw new NotFoundException('Another permission with this name already exists');
      }
    }

    const updated = await this.permissionRepo.preload({ id, ...updatePermissionDto });
    if (!updated) {
      throw new NotFoundException('Permission not found for update');
    }

    return await this.permissionRepo.save(updated);
  }

  private async initializeData() {
    const existingPermissions = await this.permissionRepo.count();
    if (existingPermissions === 0) {
      const permissions = Object.values(permissionsSeed).flatMap((permission) => Object.values(permission));
      await Promise.all(
        permissions.map((permission) =>
          this.permissionRepo.save(
            this.permissionRepo.create({
              isActive: true,
              name: permission.name,
              desc: permission.desc,
              code: permission.code,
              keyGroup: permission.keyGroup,
            }),
          ),
        ),
      );
    }
  }
}
