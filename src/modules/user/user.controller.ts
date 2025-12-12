import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { Permissions } from 'src/decorators/permission.decorator';
import { IOvResult } from 'src/interceptors/ov.interceptor';
import { SEED_PERMISSIONS } from '../permission/seeder';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  @Inject(UserService)
  private readonly userService: UserService;

  @Post()
  @Permissions(SEED_PERMISSIONS.user_create.code)
  async create(@Body() body: CreateUserDto): Promise<IOvResult> {
    return {
      metadata: await this.userService.create(body),
    };
  }

  @Get()
  @Permissions(SEED_PERMISSIONS.user_read.code)
  async findAll(): Promise<IOvResult> {
    return {
      metadata: await this.userService.findAll(),
    };
  }

  @Get(':id')
  @Permissions(SEED_PERMISSIONS.user_read.code)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Permissions(SEED_PERMISSIONS.user_update.code)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Permissions(SEED_PERMISSIONS.user_delete.code)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
