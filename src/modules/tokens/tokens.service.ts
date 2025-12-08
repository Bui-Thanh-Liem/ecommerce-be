import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Token)
    private tokenRepo: Repository<Token>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(createTokenDto: CreateTokenDto) {
    const { token, user } = createTokenDto;

    const foundUser = await this.userRepo.findOne({
      where: { id: user },
    });

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

  update(id: number, updateTokenDto: UpdateTokenDto) {
    return `This action updates a #${id} token`;
  }

  remove(id: number) {
    return `This action removes a #${id} token`;
  }
}
