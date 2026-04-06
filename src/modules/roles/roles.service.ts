import { BadGatewayException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { In, Repository } from 'typeorm';
import { RoleEntity } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private rolesRepo: Repository<RoleEntity>,

    private readonly permissionService: PermissionsService,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const { permissions: permissionIds } = createRoleDto;
    const permissionIdsSet = Array.from(new Set(permissionIds)) || [];

    //
    if (permissionIdsSet.length > 0) {
      const isValidPermissions = await this.permissionService.checkExistByIds(permissionIdsSet);
      if (!isValidPermissions) {
        throw new BadGatewayException('One or more permissions do not exist');
      }
    }

    //
    const role = this.rolesRepo.create({
      ...createRoleDto,
      permissions: permissionIdsSet.map((id) => ({ id })),
    });
    return await this.rolesRepo.save(role);
  }

  async findAll() {
    return await this.rolesRepo.find({
      relations: ['permissions'],
      select: {
        id: true,
        name: true,
        isActive: true,
        permissions: { id: true, name: true, code: true, isActive: true },
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
      relations: ['permissions'],
      select: {
        id: true,
        name: true,
        isActive: true,
        permissions: { id: true, name: true, code: true, isActive: true },
      },
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const { permissions: permissionIds, ...rest } = updateRoleDto;
    const permissionIdsSet = Array.from(new Set(permissionIds)) || [];

    // Kiểm tra nếu có permissionIds thì validate chúng
    if (permissionIdsSet.length > 0) {
      const isValidPermissions = await this.permissionService.checkExistByIds(permissionIdsSet);
      if (!isValidPermissions) {
        throw new BadGatewayException('One or more permissions do not exist');
      }
    }

    //
    const role = await this.rolesRepo.preload({
      id,
      ...rest,
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
