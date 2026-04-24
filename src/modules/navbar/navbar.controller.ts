import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NavbarService } from './navbar.service';
import { CreateNavbarDto } from './dto/create-navbar.dto';
import { UpdateNavbarDto } from './dto/update-navbar.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { NavbarDto } from './dto/navbar.dto';

@Controller('navbar')
@Serializer(NavbarDto)
export class NavbarController {
  constructor(private readonly navbarService: NavbarService) {}

  @Post()
  create(@Body() createNavbarDto: CreateNavbarDto) {
    return this.navbarService.create(createNavbarDto);
  }

  @Get()
  findAll() {
    return this.navbarService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.navbarService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNavbarDto: UpdateNavbarDto) {
    return this.navbarService.update(id, updateNavbarDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.navbarService.remove(id);
  }
}
