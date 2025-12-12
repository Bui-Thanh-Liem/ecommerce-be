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
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { OvResult } from 'src/interceptors/ov.interceptor';

@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  // constructor(private readonly usersService: UsersService) {}

  @Inject(UserService)
  private readonly userService: UserService;

  @Post()
  async create(@Body() body: CreateUserDto): Promise<OvResult> {
    return {
      metadata: await this.userService.create(body),
    };
  }

  @Get()
  async findAll(): Promise<OvResult> {
    return {
      metadata: await this.userService.findAll(),
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
