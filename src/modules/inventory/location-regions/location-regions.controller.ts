import { Permissions } from '@/decorators/permission.decorator';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateLocationRegionDto } from './dto/create-location-region.dto';
import { LocationRegionDto } from './dto/location-region.dto';
import { UpdateLocationRegionDto } from './dto/update-location-region.dto';
import { LocationRegionsService } from './location-regions.service';
import { LocationRegionMetadataDto } from './dto/metadata-location-region.dto';
import { LocationRegionQueryDto } from './dto/query-location-region.dto';
import { permissionsSeed } from '@/modules/management/permissions/seeding';
import { Public } from '@/decorators/public.decorator';
import { GetInfoGuest } from '@/decorators/get-info-guest.decorator';
import { type IInfoGuest } from '@/shared/interfaces/common/info-guest';
import { LocationRegionSelectionDto } from './dto/location-region-selection.dto';

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
  @Serializer(LocationRegionMetadataDto)
  @Permissions(permissionsSeed.locationRegions.read.code)
  async findAll(@Query() query: LocationRegionQueryDto) {
    return await this.locationRegionsService.findAll(query);
  }

  @Public()
  @Get('options')
  @Serializer(LocationRegionMetadataDto)
  async findOptions(@Query() query: LocationRegionQueryDto) {
    return await this.locationRegionsService.findOptions(query);
  }

  @Get('tree')
  @Permissions(permissionsSeed.locationRegions.read.code)
  async getTreeData(@Query() query: LocationRegionQueryDto) {
    return await this.locationRegionsService.getTreeData(query);
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

  @Public()
  @Serializer(LocationRegionSelectionDto)
  @Post('selection')
  handleLocationSelection(@GetInfoGuest() infoGuest: IInfoGuest) {
    return this.locationRegionsService.handleLocationSelection(infoGuest);
  }
}
