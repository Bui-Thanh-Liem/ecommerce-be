import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PermissionsService } from '../permissions/permissions.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleEntity } from './entities/role.entity';
import { RoleQueryDto } from './dto/query-role.dto';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { StoresService } from '@/modules/inventory/stores/stores.service';
import { IMetadata } from '@/shared/interfaces/metadata.interface';

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

  async findAll(query: RoleQueryDto): Promise<IMetadata<RoleEntity>> {
    const { page, limit } = query;

    //
    const { skip, take } = calculatePagination(page, limit);

    //
    const queryBuilder = this.rolesRepo
      .createQueryBuilder('role')

      // Join các quan hệ
      .leftJoinAndSelect('role.permissions', 'permission')
      .leftJoinAndSelect('role.stores', 'store')

      // Select các trường cụ thể
      .select([
        'role.id',
        'role.name',
        'role.desc',
        'role.isActive',
        'role.createdAt',
        'store.id',
        'store.address',
        'permission.id',
        'permission.name',
        'permission.desc',
        'permission.code',
        'permission.isActive',
        'permission.keyGroup',
      ]);

    // Phân trang và sắp xếp
    queryBuilder.orderBy('role.createdAt', 'DESC').skip(skip).take(take);

    const [data, totalData] = await queryBuilder.getManyAndCount();

    return {
      data,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async findOptions(query: RoleQueryDto): Promise<IMetadata<RoleEntity>> {
    const { page, limit } = query;
    const { take, skip } = calculatePagination(page, limit);

    const queryBuilder = this.rolesRepo
      .createQueryBuilder('role')
      .select(['role.id', 'role.name'])
      .skip(skip)
      .take(take)
      .orderBy('role.createdAt', 'DESC');

    const [data, totalData] = await queryBuilder.getManyAndCount();

    return {
      data,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async exists(ids: string[]) {
    const count = await this.rolesRepo.countBy({ id: In(ids) });
    return count === ids.length;
  }

  async findOne(id: string) {
    return await this.rolesRepo.findOne({
      where: { id },
      relations: ['permissions', 'stores'],
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
