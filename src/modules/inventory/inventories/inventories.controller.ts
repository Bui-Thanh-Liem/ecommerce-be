import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, Query } from '@nestjs/common';
import { InventoriesService } from './inventories.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { InventoryDto } from './dto/inventory.dto';
import { InventoryQueryDto } from './dto/query-inventory.dto';
import { InventoryMetadataDto } from './dto/metadata-inventory.dto';

@Controller('inventories')
@Serializer(InventoryDto)
export class InventoriesController {
  constructor(private readonly inventoriesService: InventoriesService) {}

  @Post()
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoriesService.create(createInventoryDto);
  }

  @Get()
  @Serializer(InventoryMetadataDto)
  findAll(@Query() query: InventoryQueryDto) {
    return this.inventoriesService.findAll(query);
  }

  @Get('options')
  @Serializer(InventoryMetadataDto)
  async findOptions(@Query() query: InventoryQueryDto) {
    return await this.inventoriesService.findOptions(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const inventory = await this.inventoriesService.findOne(id);
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }
    return inventory;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInventoryDto: UpdateInventoryDto) {
    return this.inventoriesService.update(id, updateInventoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoriesService.remove(id);
  }
}
