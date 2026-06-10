import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InventoriesService } from './inventories.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { InventoryDto } from './dto/inventory.dto';
import { InventoryQueryDto } from './dto/query-inventory.dto';
import { InventoryMetadataDto } from './dto/metadata-inventory.dto';
import { Permissions } from '@/decorators/permission.decorator';
import { permissionsSeed } from '@/modules/management/permissions/seeding';

@Controller('inventories')
@Serializer(InventoryDto)
export class InventoriesController {
  constructor(private readonly inventoriesService: InventoriesService) {}

  @Post()
  @Permissions(permissionsSeed.inventory.create.code)
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoriesService.create(createInventoryDto);
  }

  @Get()
  @Permissions(permissionsSeed.inventory.read.code)
  @Serializer(InventoryMetadataDto)
  findAll(@Query() query: InventoryQueryDto) {
    return this.inventoriesService.findAll(query);
  }

  @Get('options')
  @Permissions(permissionsSeed.inventory.read.code)
  @Serializer(InventoryMetadataDto)
  async findOptions(@Query() query: InventoryQueryDto) {
    return await this.inventoriesService.findOptions(query);
  }

  @Get(':id')
  @Permissions(permissionsSeed.inventory.read.code)
  async findOne(@Param('id') id: string) {
    return await this.inventoriesService.findOne(id);
  }

  @Patch(':id')
  @Permissions(permissionsSeed.inventory.update.code)
  update(@Param('id') id: string, @Body() updateInventoryDto: UpdateInventoryDto) {
    return this.inventoriesService.update(id, updateInventoryDto);
  }

  @Delete(':id')
  @Permissions(permissionsSeed.inventory.delete.code)
  remove(@Param('id') id: string) {
    return this.inventoriesService.remove(id);
  }
}
