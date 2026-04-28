import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PermissionsService } from '../permissions/permissions.service';
import { StoresService } from '../stores/stores.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleEntity } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private rolesRepo: Repository<RoleEntity>,

    private readonly permissionService: PermissionsService,
    private readonly storesService: StoresService,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const { permissions: permissionIds, stores: storeIds, name, ...rest } = createRoleDto;
    console.log('Create Role DTO:', createRoleDto);

    //
    const existingRole = await this.rolesRepo.exists({ where: { name } });
    if (existingRole) {
      throw new InternalServerErrorException('Role name already exists');
    }

    //
    if (storeIds && storeIds.length > 0) {
      const storeExists = await this.storesService.exists(storeIds);
      if (!storeExists) {
        throw new NotFoundException(`One or more stores not found`);
      }
    }

    //
    const permissionIdsSet = Array.from(new Set(permissionIds)) || [];
    if (permissionIdsSet.length > 0) {
      const isValidPermissions = await this.permissionService.checkExistByIds(permissionIdsSet);
      if (!isValidPermissions) {
        throw new NotFoundException('One or more permissions do not exist');
      }
    }

    //
    const role = this.rolesRepo.create({
      ...rest,
      name,
      permissions: permissionIdsSet.map((id) => ({ id })),
      stores: storeIds && storeIds.length > 0 ? storeIds.map((id) => ({ id })) : undefined,
    });
    return await this.rolesRepo.save(role);
  }

  async findAll() {
    return await this.rolesRepo.find({
      relations: ['permissions', 'store'],
      select: {
        id: true,
        name: true,
        desc: true,
        isActive: true,
        stores: { id: true, address: true },
        permissions: { id: true, name: true, desc: true, code: true, isActive: true, keyGroup: true },
      },
    });
  }

  async exists(ids: string[]) {
    const count = await this.rolesRepo.countBy({ id: In(ids) });
    return count === ids.length;
  }

  async findOne(id: string) {
    return await this.rolesRepo.findOne({
      where: { id },
      relations: ['permissions', 'store'],
      select: {
        id: true,
        name: true,
        desc: true,
        isActive: true,
        stores: { id: true, address: true },
        permissions: { id: true, name: true, desc: true, code: true, isActive: true },
      },
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const { permissions: permissionIds, stores: storeIds, ...rest } = updateRoleDto;
    const permissionIdsSet = Array.from(new Set(permissionIds)) || [];

    //
    if (storeIds && storeIds.length > 0) {
      const storeExists = await this.storesService.exists(storeIds);
      if (!storeExists) {
        throw new NotFoundException(`One or more stores not found`);
      }
    }

    // Kiểm tra nếu có permissionIds thì validate chúng
    if (permissionIdsSet.length > 0) {
      const isValidPermissions = await this.permissionService.checkExistByIds(permissionIdsSet);
      if (!isValidPermissions) {
        throw new NotFoundException('One or more permissions do not exist');
      }
    }

    //
    const role = await this.rolesRepo.preload({
      id,
      ...rest,
      stores: storeIds && storeIds.length > 0 ? storeIds.map((id) => ({ id })) : undefined,
      permissions: permissionIdsSet.length > 0 ? permissionIdsSet.map((id) => ({ id })) : undefined,
    });
    if (!role) throw new NotFoundException(`Role with ID ${id} not found`);

    try {
      return await this.rolesRepo.save(role);
    } catch (error) {
      throw new InternalServerErrorException('Error updating role', (error as Error).message);
    }
  }

  async remove(id: string) {
    const role = await this.rolesRepo.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return await this.rolesRepo.remove(role);
  }
}
