import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TopBannersService } from './top-banners.service';
import { CreateTopBannerDto } from './dto/create-top-banner.dto';
import { UpdateTopBannerDto } from './dto/update-top-banner.dto';
import { permissionsSeed } from '@/modules/management/permissions/seeding';
import { Permissions } from '@/decorators/permission.decorator';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { TopBannerMetadataDto } from './dto/metadata-top-banner.dto';
import { TopBannerQueryDto } from './dto/query-top-banner.dto';
import { TopBannerDto } from './dto/top-banner.dto';

@Controller('top-banners')
@Serializer(TopBannerDto)
export class TopBannersController {
  constructor(private readonly topBannersService: TopBannersService) {}

  @Post()
  @Permissions(permissionsSeed.topBanner.create.code)
  async create(@Body() dto: CreateTopBannerDto) {
    return await this.topBannersService.create(dto);
  }

  @Get()
  @Permissions(permissionsSeed.topBanner.read.code)
  @Serializer(TopBannerMetadataDto)
  async findAll(@Query() query: TopBannerQueryDto) {
    return await this.topBannersService.findAll(query);
  }

  @Get('options')
  @Permissions(permissionsSeed.topBanner.read.code)
  @Serializer(TopBannerMetadataDto)
  async findOptions(@Query() query: TopBannerQueryDto) {
    return await this.topBannersService.findOptions(query);
  }

  @Get(':id')
  @Permissions(permissionsSeed.topBanner.read.code)
  async findOne(@Param('id') id: string) {
    return await this.topBannersService.findOne(id);
  }

  @Patch(':id')
  @Permissions(permissionsSeed.topBanner.update.code)
  async update(@Param('id') id: string, @Body() dto: UpdateTopBannerDto) {
    return await this.topBannersService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(permissionsSeed.topBanner.delete.code)
  async remove(@Param('id') id: string) {
    return await this.topBannersService.remove(id);
  }
}
