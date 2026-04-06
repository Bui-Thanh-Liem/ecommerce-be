import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LocationRegionsService } from './location-regions.service';
import { CreateLocationRegionDto } from './dto/create-location-region.dto';
import { UpdateLocationRegionDto } from './dto/update-location-region.dto';
import { Permissions } from '@/decorators/permission.decorator';
import { permissionsSeed } from '../permissions/seeding';

@Controller('location-regions')
export class LocationRegionsController {
  constructor(private readonly locationRegionsService: LocationRegionsService) {}

  @Post()
  @Permissions(permissionsSeed.locationRegions.create.code)
  async create(@Body() createLocationRegionDto: CreateLocationRegionDto) {
    return await this.locationRegionsService.create(createLocationRegionDto);
  }

  @Get()
  @Permissions(permissionsSeed.locationRegions.read.code)
  async findAll() {
    return await this.locationRegionsService.findAll();
  }

  @Get(':id')
  @Permissions(permissionsSeed.locationRegions.read.code)
  async findOne(@Param('id') id: string) {
    return await this.locationRegionsService.findOne(id);
  }

  @Patch(':id')
  @Permissions(permissionsSeed.locationRegions.update.code)
  async update(@Param('id') id: string, @Body() updateLocationRegionDto: UpdateLocationRegionDto) {
    return await this.locationRegionsService.update(id, updateLocationRegionDto);
  }

  @Delete(':id')
  @Permissions(permissionsSeed.locationRegions.delete.code)
  async remove(@Param('id') id: string) {
    return await this.locationRegionsService.remove(id);
  }
}
