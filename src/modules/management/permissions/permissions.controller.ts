import { Permissions } from '@/decorators/permission.decorator';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionDto } from './dto/permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsService } from './permissions.service';
import { permissionsSeed } from './seeding';

@ApiTags('Permissions')
@Controller('permissions')
@Serializer(PermissionDto)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách quyền' })
  @ApiOkResponse({ description: 'Danh sách quyền đã được lấy thành công', type: [PermissionDto] })
  @Permissions(permissionsSeed.permissions.view.code)
  findAll() {
    return this.permissionsService.findAll();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật quyền' })
  @Permissions(permissionsSeed.permissions.update.code)
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsService.update(id, updatePermissionDto);
  }
}
