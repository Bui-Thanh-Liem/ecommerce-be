import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PromotionMetadataDto } from './dto/metadata-promotion.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { PromotionDto } from './dto/promotion.dto';
import { PromotionQueryDto } from './dto/query-promotion.dto';

@Controller('promotions')
@Serializer(PromotionDto)
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionsService.create(createPromotionDto);
  }

  @Get()
  @Serializer(PromotionMetadataDto)
  async findAll(@Query() query: PromotionQueryDto) {
    return this.promotionsService.findAll(query);
  }

  @Get('options')
  @Serializer(PromotionMetadataDto)
  async findOptions(@Query() query: PromotionQueryDto) {
    return this.promotionsService.findOptions(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePromotionDto: UpdatePromotionDto) {
    return this.promotionsService.update(id, updatePromotionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promotionsService.remove(id);
  }
}
