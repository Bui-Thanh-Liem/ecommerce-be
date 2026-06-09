import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MainBannerService } from './main-banner.service';
import { CreateMainBannerDto } from './dto/create-main-banner.dto';
import { UpdateMainBannerDto } from './dto/update-main-banner.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { MainBannerDto } from './dto/main-banner.dto';
import { MainBannerMetadataDto } from './dto/metadata-main-banner.dto';
import { MainBannerQueryDto } from './dto/query-main-banner.dto';
import { Public } from '@/decorators/public.decorator';

@Controller('main-banners')
@Serializer(MainBannerDto)
export class MainBannerController {
  constructor(private readonly mainBannerService: MainBannerService) {}

  @Post()
  create(@Body() createMainBannerDto: CreateMainBannerDto) {
    return this.mainBannerService.create(createMainBannerDto);
  }

  @Get()
  @Serializer(MainBannerMetadataDto)
  findAll(@Query() query: MainBannerQueryDto) {
    return this.mainBannerService.findAll(query);
  }

  @Public()
  @Get('options')
  @Serializer(MainBannerMetadataDto)
  findOptions() {
    return this.mainBannerService.findAll({ page: 1, limit: 10 });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mainBannerService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMainBannerDto: UpdateMainBannerDto) {
    return this.mainBannerService.update(id, updateMainBannerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mainBannerService.remove(id);
  }
}
