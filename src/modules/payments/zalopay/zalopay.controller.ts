import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ZaloPayService } from './zalopay.service';
import { CreateZaloPayDto } from './dto/create-zalopay.dto';
import { UpdateZaloPayDto } from './dto/update-zalopay.dto';

@Controller('zalopay')
export class ZaloPayController {
  constructor(private readonly zaloPayService: ZaloPayService) {}

  @Post()
  create(@Body() createZaloPayDto: CreateZaloPayDto) {
    return this.zaloPayService.create(createZaloPayDto);
  }

  @Get()
  findAll() {
    return this.zaloPayService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.zaloPayService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateZaloPayDto: UpdateZaloPayDto) {
    return this.zaloPayService.update(+id, updateZaloPayDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.zaloPayService.remove(+id);
  }
}
