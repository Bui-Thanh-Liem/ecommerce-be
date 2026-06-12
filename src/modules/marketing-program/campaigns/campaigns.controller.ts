import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { CampaignDto } from './dto/campaign.dto';
import { CampaignMetadataDto } from './dto/metadata-campaign.dto';
import { CampaignQueryDto } from './dto/query-campaign.dto';
import { Permissions } from '@/decorators/permission.decorator';
import { permissionsSeed } from '@/modules/management/permissions/seeding';

@Controller('campaigns')
@Serializer(CampaignDto)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @Permissions(permissionsSeed.campaign.create.code)
  async create(@Body() dto: CreateCampaignDto) {
    return await this.campaignsService.create(dto);
  }

  @Get()
  @Permissions(permissionsSeed.campaign.read.code)
  @Serializer(CampaignMetadataDto)
  async findAll(@Query() query: CampaignQueryDto) {
    return await this.campaignsService.findAll(query);
  }

  @Get('options')
  @Permissions(permissionsSeed.campaign.read.code)
  @Serializer(CampaignMetadataDto)
  async findOptions(@Query() query: CampaignQueryDto) {
    return await this.campaignsService.findOptions(query);
  }

  @Get(':id')
  @Permissions(permissionsSeed.campaign.read.code)
  async findOne(@Param('id') id: string) {
    return await this.campaignsService.findOne(id);
  }

  @Patch(':id')
  @Permissions(permissionsSeed.campaign.update.code)
  async update(@Param('id') id: string, @Body() updateCampaignDto: UpdateCampaignDto) {
    return await this.campaignsService.update(id, updateCampaignDto);
  }

  @Delete(':id')
  @Permissions(permissionsSeed.campaign.delete.code)
  async remove(@Param('id') id: string) {
    return await this.campaignsService.remove(id);
  }
}
