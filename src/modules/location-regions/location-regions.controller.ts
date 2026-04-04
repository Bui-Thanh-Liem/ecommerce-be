import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LocationRegionsService } from './location-regions.service';
import { CreateLocationRegionDto } from './dto/create-location-region.dto';
import { UpdateLocationRegionDto } from './dto/update-location-region.dto';

@Controller('location-regions')
export class LocationRegionsController {
  constructor(private readonly locationRegionsService: LocationRegionsService) {}

  @Post()
  async create(@Body() createLocationRegionDto: CreateLocationRegionDto) {
    return await this.locationRegionsService.create(createLocationRegionDto);
  }

  @Get()
  async findAll() {
    return await this.locationRegionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.locationRegionsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateLocationRegionDto: UpdateLocationRegionDto) {
    return await this.locationRegionsService.update(id, updateLocationRegionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.locationRegionsService.remove(id);
  }
}
