import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { PermissionDto } from './dto/permission.dto';
import { permissionsSeed } from './seeding';
import { Permissions } from '@/decorators/permission.decorator';

@Controller('permissions')
@Serializer(PermissionDto)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @Permissions(permissionsSeed.permissions.view.code)
  findAll() {
    return this.permissionsService.findAll();
  }

  @Patch(':id')
  @Permissions(permissionsSeed.permissions.update.code)
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsService.update(id, updatePermissionDto);
  }
}
