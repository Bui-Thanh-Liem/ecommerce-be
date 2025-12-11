import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionService } from '../permission/permission.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,

    private readonly permissionService: PermissionService,
  ) {}

  async create(body: CreateRoleDto) {
    const { code, name, permissions } = body;

    const foundPermissions =
      await this.permissionService.findByIds(permissions);

    const dataCreate = this.roleRepo.create({
      code,
      name,
      permissions: foundPermissions,
    });

    return await this.roleRepo.save(dataCreate);
  }

  findAll() {
    return `This action returns all roles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, body: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
