import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Permissions } from '@/decorators/permission.decorator';
import { permissionsSeed } from '../permissions/seeding';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permissions([permissionsSeed.roles.create.code])
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Permissions([permissionsSeed.roles.read.code])
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Permissions([permissionsSeed.roles.read.code])
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @Permissions([permissionsSeed.roles.update.code])
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @Permissions([permissionsSeed.roles.delete.code])
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
