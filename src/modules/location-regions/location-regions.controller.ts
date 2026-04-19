import { Permissions } from '@/decorators/permission.decorator';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { permissionsSeed } from '../permissions/seeding';
import { CreateLocationRegionDto } from './dto/create-location-region.dto';
import { LocationRegionDto } from './dto/location-region.dto';
import { UpdateLocationRegionDto } from './dto/update-location-region.dto';
import { LocationRegionsService } from './location-regions.service';

@Controller('location-regions')
@Serializer(LocationRegionDto)
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

  @Get('tree/:id')
  @Permissions(permissionsSeed.locationRegions.read.code)
  async getTreeDataByRootId(@Param('id') id?: string) {
    return await this.locationRegionsService.getTreeData(id);
  }

  @Get('tree')
  @Permissions(permissionsSeed.locationRegions.read.code)
  async getTreeData() {
    return await this.locationRegionsService.getTreeData();
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
