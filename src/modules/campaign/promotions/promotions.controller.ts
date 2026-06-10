import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PromotionMetadataDto } from './dto/metadata-promotion.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { PromotionDto } from './dto/promotion.dto';
import { PromotionQueryDto } from './dto/query-promotion.dto';
import { Permissions } from '@/decorators/permission.decorator';
import { permissionsSeed } from '@/modules/management/permissions/seeding';

@Controller('promotions')
@Serializer(PromotionDto)
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @Permissions(permissionsSeed.promotion.create.code)
  create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionsService.create(createPromotionDto);
  }

  @Get()
  @Permissions(permissionsSeed.promotion.read.code)
  @Serializer(PromotionMetadataDto)
  async findAll(@Query() query: PromotionQueryDto) {
    return this.promotionsService.findAll(query);
  }

  @Get('options')
  @Permissions(permissionsSeed.promotion.read.code)
  @Serializer(PromotionMetadataDto)
  async findOptions(@Query() query: PromotionQueryDto) {
    return this.promotionsService.findOptions(query);
  }

  @Get(':id')
  @Permissions(permissionsSeed.promotion.read.code)
  findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(id);
  }

  @Patch(':id')
  @Permissions(permissionsSeed.promotion.update.code)
  update(@Param('id') id: string, @Body() updatePromotionDto: UpdatePromotionDto) {
    return this.promotionsService.update(id, updatePromotionDto);
  }

  @Delete(':id')
  @Permissions(permissionsSeed.promotion.delete.code)
  remove(@Param('id') id: string) {
    return this.promotionsService.remove(id);
  }
}
