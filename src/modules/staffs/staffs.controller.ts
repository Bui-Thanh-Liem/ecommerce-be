import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { CreateStaffDto } from './dto/create-staff.dto';
import { StaffDto } from './dto/staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffsService } from './staffs.service';
import { Permissions } from '@/decorators/permission.decorator';
import { permissionsSeed } from '../permissions/seeding';

// @UseInterceptors(new SerializerInterceptor(StaffDto))
@Serializer(StaffDto)
@Controller('staffs')
export class StaffsController {
  constructor(private readonly staffsService: StaffsService) {}

  @Post()
  @Permissions(permissionsSeed.staffs.create.code)
  async create(@Body() createStaffDto: CreateStaffDto) {
    return await this.staffsService.create(createStaffDto);
  }

  @Get()
  @Permissions(permissionsSeed.staffs.read.code)
  findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '10', @Query('email') email: string) {
    return this.staffsService.findAll({ page, limit, email });
  }

  @Get(':id')
  @Permissions(permissionsSeed.staffs.read.code)
  async findOne(@Param('id') id: string) {
    const staff = await this.staffsService.findOne(id);

    if (!staff) {
      throw new NotFoundException();
    }

    return staff;
  }

  @Patch(':id')
  @Permissions(permissionsSeed.staffs.update.code)
  async update(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return await this.staffsService.update(id, updateStaffDto);
  }

  @Delete(':id')
  @Permissions(permissionsSeed.staffs.delete.code)
  async remove(@Param('id') id: string) {
    return await this.staffsService.remove(id);
  }
}
