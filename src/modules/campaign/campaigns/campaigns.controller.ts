import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { CampaignDto } from './dto/campaign.dto';
import { CampaignMetadataDto } from './dto/metadata-campaign.dto';
import { CampaignQueryDto } from './dto/query-campaign.dto';

@Controller('campaigns')
@Serializer(CampaignDto)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  create(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignsService.create(createCampaignDto);
  }

  @Get()
  @Serializer(CampaignMetadataDto)
  findAll(@Query() query: CampaignQueryDto) {
    return this.campaignsService.findAll(query);
  }

  @Get('options')
  @Serializer(CampaignMetadataDto)
  findOptions(@Query() query: CampaignQueryDto) {
    return this.campaignsService.findOptions(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCampaignDto: UpdateCampaignDto) {
    return this.campaignsService.update(id, updateCampaignDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.campaignsService.remove(id);
  }
}
