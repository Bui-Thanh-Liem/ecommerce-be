import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Permissions } from '@/decorators/permission.decorator';
import { permissionsSeed } from '../permissions/seeding';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { RoleDto } from './dto/role.dto';

@Controller('roles')
@Serializer(RoleDto)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permissions(permissionsSeed.roles.create.code)
  async create(@Body() createRoleDto: CreateRoleDto) {
    return await this.rolesService.create(createRoleDto);
  }

  @Get()
  @Permissions(permissionsSeed.roles.read.code)
  async findAll() {
    return await this.rolesService.findAll();
  }

  @Get(':id')
  @Permissions(permissionsSeed.roles.read.code)
  async findOne(@Param('id') id: string) {
    return await this.rolesService.findOne(id);
  }

  @Patch(':id')
  @Permissions(permissionsSeed.roles.update.code)
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return await this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @Permissions(permissionsSeed.roles.delete.code)
  async remove(@Param('id') id: string) {
    return await this.rolesService.remove(id);
  }
}
