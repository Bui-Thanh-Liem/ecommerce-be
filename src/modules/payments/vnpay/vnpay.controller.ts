import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VnPayService } from './vnpay.service';
import { CreateVnPayDto } from './dto/create-vnpay.dto';
import { UpdateVnPayDto } from './dto/update-vnpay.dto';

@Controller('vnpay')
export class VnPayController {
  constructor(private readonly vnPayService: VnPayService) {}

  @Post()
  create(@Body() createVnPayDto: CreateVnPayDto) {
    return this.vnPayService.create(createVnPayDto);
  }

  @Get()
  findAll() {
    return this.vnPayService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vnPayService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVnPayDto: UpdateVnPayDto) {
    return this.vnPayService.update(+id, updateVnPayDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vnPayService.remove(+id);
  }
}
