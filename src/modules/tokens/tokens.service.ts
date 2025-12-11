import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../users/user.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { Token } from './entities/token.entity';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Token)
    private tokenRepo: Repository<Token>,

    private userService: UserService,
  ) {}

  async create(body: CreateTokenDto) {
    const { token, user } = body;

    const foundUser = await this.userService.findOne(user);

    console.log('User :::', foundUser);

    if (!foundUser || !user) {
      throw new NotFoundException('User not found');
    }

    const dataCreate = this.tokenRepo.create({
      token,
      user: foundUser,
    });
    return await this.tokenRepo.save(dataCreate);
  }

  findAll() {
    return `This action returns all tokens`;
  }

  findOne(id: number) {
    return `This action returns a #${id} token`;
  }

  update(id: number, body: UpdateTokenDto) {
    return `This action updates a #${id} token`;
  }

  remove(id: number) {
    return `This action removes a #${id} token`;
  }
}
