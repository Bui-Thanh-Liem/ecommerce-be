import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MarketingProgramsService } from './marketing-programs.service';
import { CreateMarketingProgramDto } from './dto/create-mkt-program.dto';
import { UpdateMarketingProgramDto } from './dto/update-mkt-program.dto';
import { Permissions } from '@/decorators/permission.decorator';
import { permissionsSeed } from '@/modules/management/permissions/seeding';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { MktProgramDto } from './dto/mkt-program.dto';
import { MktProgramMetadataDto } from './dto/metadata-mkt-program.dto';
import { MktProgramQueryDto } from './dto/query-mkt-program.dto';

@Controller('marketing-programs')
@Serializer(MktProgramDto)
export class MarketingProgramsController {
  constructor(private readonly marketingProgramsService: MarketingProgramsService) {}

  @Post()
  @Permissions(permissionsSeed.mktProgram.create.code)
  async create(@Body() dto: CreateMarketingProgramDto) {
    return await this.marketingProgramsService.create(dto);
  }

  @Get()
  @Permissions(permissionsSeed.mktProgram.read.code)
  @Serializer(MktProgramMetadataDto)
  async findAll(@Query() query: MktProgramQueryDto) {
    return await this.marketingProgramsService.findAll(query);
  }

  @Get('options')
  @Permissions(permissionsSeed.mktProgram.read.code)
  @Serializer(MktProgramMetadataDto)
  async findOptions(@Query() query: MktProgramQueryDto) {
    return await this.marketingProgramsService.findOptions(query);
  }

  @Get(':id')
  @Permissions(permissionsSeed.mktProgram.read.code)
  async findOne(@Param('id') id: string) {
    return await this.marketingProgramsService.findOne(id);
  }

  @Patch(':id')
  @Permissions(permissionsSeed.mktProgram.update.code)
  async update(@Param('id') id: string, @Body() dto: UpdateMarketingProgramDto) {
    return await this.marketingProgramsService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(permissionsSeed.mktProgram.delete.code)
  async remove(@Param('id') id: string) {
    return await this.marketingProgramsService.remove(id);
  }
}
