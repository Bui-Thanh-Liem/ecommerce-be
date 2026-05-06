import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { TeamDto } from './dto/team.dto';
import { TeamQueryDto } from './dto/query-team.dto';
import { permissionsSeed } from '../permissions/seeding';
import { Permissions } from '@/decorators/permission.decorator';

@Controller('teams')
@Serializer(TeamDto)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @Permissions(permissionsSeed.team.create.code)
  async create(@Body() createTeamDto: CreateTeamDto) {
    return await this.teamsService.create(createTeamDto);
  }

  @Get()
  @Permissions(permissionsSeed.team.read.code)
  async findAll(@Query() query: TeamQueryDto) {
    return await this.teamsService.findAll(query);
  }

  @Get(':id')
  @Permissions(permissionsSeed.team.read.code)
  async findOne(@Param('id') id: string) {
    return await this.teamsService.findOne(id);
  }

  @Patch(':id')
  @Permissions(permissionsSeed.team.update.code)
  async update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
    return await this.teamsService.update(id, updateTeamDto);
  }

  @Delete(':id')
  @Permissions(permissionsSeed.team.delete.code)
  async remove(@Param('id') id: string) {
    return await this.teamsService.remove(id);
  }
}
