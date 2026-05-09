import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { CreateStaffDto } from './dto/create-staff.dto';
import { StaffDto } from './dto/staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffsService } from './staffs.service';
import { Permissions } from '@/decorators/permission.decorator';
import { permissionsSeed } from '../permissions/seeding';
import { CurrentStaff } from '@/decorators/current-staff.decorator';
import { StaffEntity } from './entities/staff.entity';
import { AdminGuard } from './guards/admin.guard';
import { TargetStaff } from '@/decorators/target-staff.decorator';
import { StaffQueryDto } from './dto/query-staff.dto';
import { StaffMetadataDto } from './dto/metadata-staff.dto';

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
  @Serializer(StaffMetadataDto)
  @Permissions(permissionsSeed.staffs.read.code)
  async findAll(@Query() query: StaffQueryDto) {
    const result = await this.staffsService.findAll(query);
    console.log('StaffsController ~ findAll:', result);

    return result;
  }

  @Get(':id')
  @Permissions(permissionsSeed.staffs.read.code)
  async findOne(@Param('id') id: string) {
    const staff = await this.staffsService.findOne(id);

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    return staff;
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @Permissions(permissionsSeed.staffs.update.code)
  async update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
    @CurrentStaff() currentStaff: StaffEntity,
    @TargetStaff() targetStaff: StaffEntity,
  ) {
    return await this.staffsService.update(id, updateStaffDto, currentStaff, targetStaff);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @Permissions(permissionsSeed.staffs.delete.code)
  async remove(
    @Param('id') id: string,
    @CurrentStaff() currentStaff: StaffEntity,
    @TargetStaff() targetStaff: StaffEntity,
  ) {
    return await this.staffsService.remove(id, currentStaff, targetStaff);
  }
}
