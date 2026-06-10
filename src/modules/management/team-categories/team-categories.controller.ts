import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TeamCategoriesService } from './team-categories.service';
import { CreateTeamCategoryDto } from './dto/create-team-category.dto';
import { UpdateTeamCategoryDto } from './dto/update-team-category.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { TeamCategoryDto } from './dto/team-category.dto';
import { TeamCategoryMetadataDto } from './dto/metadata-team-category.dto';
import { TeamCategoryQueryDto } from './dto/query-team-category.dto';
import { permissionsSeed } from '../permissions/seeding';
import { Permissions } from '@/decorators/permission.decorator';

@Serializer(TeamCategoryDto)
@Controller('team-categories')
export class TeamCategoriesController {
  constructor(private readonly teamCategoriesService: TeamCategoriesService) {}

  @Post()
  @Permissions(permissionsSeed.teamCategory.create.code)
  create(@Body() createTeamCategoryDto: CreateTeamCategoryDto) {
    return this.teamCategoriesService.create(createTeamCategoryDto);
  }

  @Get()
  @Permissions(permissionsSeed.teamCategory.read.code)
  @Serializer(TeamCategoryMetadataDto)
  findAll(@Query() query: TeamCategoryQueryDto) {
    return this.teamCategoriesService.findAll(query);
  }

  @Get('options')
  @Serializer(TeamCategoryMetadataDto)
  findOptions(@Query() query: TeamCategoryQueryDto) {
    return this.teamCategoriesService.findOptions(query);
  }

  @Get(':id')
  @Permissions(permissionsSeed.teamCategory.read.code)
  findOne(@Param('id') id: string) {
    return this.teamCategoriesService.findOne(id);
  }

  @Patch(':id')
  @Permissions(permissionsSeed.teamCategory.update.code)
  update(@Param('id') id: string, @Body() updateTeamCategoryDto: UpdateTeamCategoryDto) {
    return this.teamCategoriesService.update(id, updateTeamCategoryDto);
  }

  @Delete(':id')
  @Permissions(permissionsSeed.teamCategory.delete.code)
  remove(@Param('id') id: string) {
    return this.teamCategoriesService.remove(id);
  }
}
