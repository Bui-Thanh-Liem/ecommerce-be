import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { Public } from '@/decorators/public.decorator';
import { PopularSearchDto } from './dto/popular-search.dto';
import { PopularSearchService } from './popular-search.service';
import { PopularSearchQueryDto } from './dto/query-popular-search.dto';
import { PopularSearchMetadataDto } from './dto/metadata-popular-search.dto';
import { CreatePopularSearchDto } from './dto/create-popular-search.dto';
import { UpdatePopularSearchDto } from './dto/update-popular-search.dto';

@Controller('popular-searches')
@Serializer(PopularSearchDto)
export class PopularSearchController {
  constructor(private readonly popularSearchService: PopularSearchService) {}

  @Post()
  async create(@Body() dto: CreatePopularSearchDto) {
    return await this.popularSearchService.create(dto);
  }

  @Get()
  @Serializer(PopularSearchMetadataDto)
  findAll(@Query() queries: PopularSearchQueryDto) {
    return this.popularSearchService.findAll(queries);
  }

  @Public()
  @Get('options')
  @Serializer(PopularSearchMetadataDto)
  async findOptions(@Query() query: PopularSearchQueryDto) {
    return await this.popularSearchService.findOptions(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.popularSearchService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePopularSearchDto) {
    return this.popularSearchService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.popularSearchService.remove(id);
  }
}
