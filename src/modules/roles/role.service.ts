import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PermissionService } from '../permission/permission.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,

    private readonly permissionService: PermissionService,
  ) {}

  async create(body: CreateRoleDto) {
    const { name, permissions, description } = body;

    // Check if role already exists
    const existingRole = await this.roleRepo.findOne({
      where: { name },
    });
    if (existingRole) {
      throw new ConflictException('Role name already exists');
    }

    // Find permissions
    const foundPermissions =
      await this.permissionService.findByIds(permissions);
    if (
      foundPermissions.length === 0 ||
      foundPermissions.length !== permissions.length
    ) {
      throw new Error('No valid permissions found');
    }

    // Create role
    const dataCreate = this.roleRepo.create({
      name,
      description,
      permissions: foundPermissions,
    });

    // Save role
    return await this.roleRepo.save(dataCreate);
  }

  async findAll() {
    return await this.roleRepo.find();
  }

  async findOne(id: string) {
    return await this.roleRepo.findOne({
      where: { id },
    });
  }

  async findByIds(ids: string[]): Promise<Role[]> {
    return await this.roleRepo.find({
      where: { id: In(ids) },
    });
  }

  update(id: string, body: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: string) {
    return `This action removes a #${id} role`;
  }
}
