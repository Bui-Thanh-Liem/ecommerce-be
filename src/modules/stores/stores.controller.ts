import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Permissions } from '@/decorators/permission.decorator';
import { permissionsSeed } from '../permissions/seeding';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @Permissions([permissionsSeed.stores.create.code])
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Get()
  @Permissions([permissionsSeed.stores.read.code])
  findAll() {
    return this.storesService.findAll();
  }

  @Get(':id')
  @Permissions([permissionsSeed.stores.read.code])
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @Patch(':id')
  @Permissions([permissionsSeed.stores.update.code])
  update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storesService.update(id, updateStoreDto);
  }

  @Delete(':id')
  @Permissions([permissionsSeed.stores.delete.code])
  remove(@Param('id') id: string) {
    return this.storesService.remove(id);
  }
}
