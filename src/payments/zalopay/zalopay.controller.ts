import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ZalopayService } from './zalopay.service';
import { CreateZalopayDto } from './dto/create-zalopay.dto';
import { UpdateZalopayDto } from './dto/update-zalopay.dto';

@Controller('zalopay')
export class ZalopayController {
  constructor(private readonly zalopayService: ZalopayService) {}

  @Post()
  create(@Body() createZalopayDto: CreateZalopayDto) {
    return this.zalopayService.create(createZalopayDto);
  }

  @Get()
  findAll() {
    return this.zalopayService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.zalopayService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateZalopayDto: UpdateZalopayDto) {
    return this.zalopayService.update(+id, updateZalopayDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.zalopayService.remove(+id);
  }
}
