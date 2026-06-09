import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MainBannerService } from './main-banner.service';
import { CreateMainBannerDto } from './dto/create-main-banner.dto';
import { UpdateMainBannerDto } from './dto/update-main-banner.dto';

@Controller('main-banner')
export class MainBannerController {
  constructor(private readonly mainBannerService: MainBannerService) {}

  @Post()
  create(@Body() createMainBannerDto: CreateMainBannerDto) {
    return this.mainBannerService.create(createMainBannerDto);
  }

  @Get()
  findAll() {
    return this.mainBannerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mainBannerService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMainBannerDto: UpdateMainBannerDto) {
    return this.mainBannerService.update(+id, updateMainBannerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mainBannerService.remove(+id);
  }
}
