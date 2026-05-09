import { Permissions } from '@/decorators/permission.decorator';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { permissionsSeed } from '../permissions/seeding';
import { CreateStoreDto } from './dto/create-store.dto';
import { StoreDto } from './dto/store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoresService } from './stores.service';

@Controller('stores')
@Serializer(StoreDto)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @Permissions(permissionsSeed.stores.create.code)
  async create(@Body() createStoreDto: CreateStoreDto) {
    return await this.storesService.create(createStoreDto);
  }

  @Get()
  @Permissions(permissionsSeed.stores.read.code)
  async findAll() {
    return await this.storesService.findAll();
  }

  @Get(':id')
  @Permissions(permissionsSeed.stores.read.code)
  async findOne(@Param('id') id: string) {
    return await this.storesService.findOne(id);
  }

  @Patch(':id')
  @Permissions(permissionsSeed.stores.update.code)
  async update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return await this.storesService.update(id, updateStoreDto);
  }

  @Delete(':id')
  @Permissions(permissionsSeed.stores.delete.code)
  async remove(@Param('id') id: string) {
    return await this.storesService.remove(id);
  }
}
