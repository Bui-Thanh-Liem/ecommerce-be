import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { IOvResult } from 'src/interceptors/ov.interceptor';
import { SEED_PERMISSIONS } from '../permission/seeder';
import { Permissions } from 'src/decorators/permission.decorator';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @Permissions(SEED_PERMISSIONS.role_create.code)
  async create(@Body() body: CreateRoleDto): Promise<IOvResult> {
    return { metadata: await this.roleService.create(body) };
  }

  @Get()
  @Permissions(SEED_PERMISSIONS.role_read.code)
  async findAll(): Promise<IOvResult> {
    return { metadata: await this.roleService.findAll() };
  }

  @Get(':id')
  @Permissions(SEED_PERMISSIONS.role_read.code)
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  @Permissions(SEED_PERMISSIONS.role_update.code)
  update(@Param('id') id: string, @Body() body: UpdateRoleDto) {
    return this.roleService.update(id, body);
  }

  @Delete(':id')
  @Permissions(SEED_PERMISSIONS.role_delete.code)
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
