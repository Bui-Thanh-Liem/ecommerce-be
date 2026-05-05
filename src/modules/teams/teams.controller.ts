import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { TeamDto } from './dto/team.dto';
import { QueryDto } from '@/shared/dtos/query.dto';

@Controller('teams')
@Serializer(TeamDto)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  async create(@Body() createTeamDto: CreateTeamDto) {
    return await this.teamsService.create(createTeamDto);
  }

  @Get()
  async findAll(@Query() query: QueryDto, @Query('store', new ParseUUIDPipe({ version: '4' })) store: string) {
    return await this.teamsService.findAll({
      ...query,
      store,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.teamsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
    return await this.teamsService.update(id, updateTeamDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.teamsService.remove(id);
  }
}
