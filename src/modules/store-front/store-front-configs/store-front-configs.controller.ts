import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { StoreFrontConfigsService } from './store-front-configs.service';
import { CreateStoreFrontConfigDto } from './dto/create-store-front-config.dto';
import { UpdateStoreFrontConfigDto } from './dto/update-store-front-config.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { StoreFrontConfigDto } from './dto/store-front-config.dto';

@Controller('store-front-configs')
@Serializer(StoreFrontConfigDto)
export class StoreFrontConfigsController {
  constructor(private readonly storeFrontConfigsService: StoreFrontConfigsService) {}

  @Post()
  async create(@Body() dto: CreateStoreFrontConfigDto) {
    return await this.storeFrontConfigsService.create(dto);
  }

  @Get()
  async findConfig() {
    return await this.storeFrontConfigsService.findConfig();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateStoreFrontConfigDto) {
    return await this.storeFrontConfigsService.update(id, dto);
  }
}
