import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OptionService } from './option.service';
import { CreateOptionDto } from './dto/create-option.dto';
import { UpdateOptionDto } from './dto/update-option.dto';

@Controller('option')
export class OptionController {
  constructor(private readonly optionService: OptionService) {}

  @Post()
  create(@Body() body: CreateOptionDto) {
    return this.optionService.create(body);
  }

  @Get()
  findAll() {
    return this.optionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.optionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateOptionDto) {
    return this.optionService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.optionService.remove(id);
  }
}
