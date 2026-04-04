import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { Serializer } from 'src/interceptors/serializer.interceptor';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { UserDto } from './dto/user.dto';
import { StaffsService } from './staffs.service';

// @UseInterceptors(new SerializerInterceptor(UserDto))
@Serializer(UserDto)
@Controller('staffs')
export class StaffsController {
  constructor(private readonly staffsService: StaffsService) {}

  @Post()
  async create(@Body() createStaffDto: CreateStaffDto) {
    console.log(createStaffDto);

    return await this.staffsService.create(createStaffDto);
  }

  @Get()
  findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '10', @Query('email') email: string) {
    console.log('StaffsController - findAll');
    return this.staffsService.findAll({ page, limit, email });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const staff = await this.staffsService.findOne(id);

    if (!staff) {
      throw new NotFoundException();
    }

    return staff;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return await this.staffsService.update(id, updateStaffDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffsService.remove(id);
  }
}
