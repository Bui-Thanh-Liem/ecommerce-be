import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TeamCategoriesService } from './team-categories.service';
import { CreateTeamCategoryDto } from './dto/create-team-category.dto';
import { UpdateTeamCategoryDto } from './dto/update-team-category.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { TeamCategoryDto } from './dto/team-category.dto';
import { TeamCategoryMetadataDto } from './dto/metadata-team-category.dto';
import { TeamCategoryQueryDto } from './dto/query-team-category.dto';

@Serializer(TeamCategoryDto)
@Controller('team-categories')
export class TeamCategoriesController {
  constructor(private readonly teamCategoriesService: TeamCategoriesService) {}

  @Post()
  create(@Body() createTeamCategoryDto: CreateTeamCategoryDto) {
    return this.teamCategoriesService.create(createTeamCategoryDto);
  }

  @Get()
  @Serializer(TeamCategoryMetadataDto)
  findAll(@Query() query: TeamCategoryQueryDto) {
    return this.teamCategoriesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamCategoriesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeamCategoryDto: UpdateTeamCategoryDto) {
    return this.teamCategoriesService.update(id, updateTeamCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamCategoriesService.remove(id);
  }
}
