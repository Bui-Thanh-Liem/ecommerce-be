import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { MenuDto } from './dto/menu.dto';
import { MenuQueryDto } from './dto/query-menu.dto';
import { MenuMetadataDto } from './dto/metadata-menu.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenuService } from './menu.service';
import { Public } from '@/decorators/public.decorator';
import { Permissions } from '@/decorators/permission.decorator';
import { permissionsSeed } from '@/modules/management/permissions/seeding';

@Controller('menus')
@Serializer(MenuDto)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @Permissions(permissionsSeed.productNavbar.create.code)
  create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto);
  }

  @Get()
  @Permissions(permissionsSeed.productNavbar.read.code)
  @Serializer(MenuMetadataDto)
  findAll(@Query() query: MenuQueryDto) {
    return this.menuService.findAll(query);
  }

  @Public()
  @Get('options')
  @Serializer(MenuMetadataDto)
  async findOptions(@Query() query: MenuQueryDto) {
    return await this.menuService.findOptions(query);
  }

  @Get(':id')
  @Permissions(permissionsSeed.productNavbar.read.code)
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }

  @Patch(':id')
  @Permissions(permissionsSeed.productNavbar.update.code)
  update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.menuService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(permissionsSeed.productNavbar.delete.code)
  remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }
}
