import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    private dataSource: DataSource,
    private entityManager: EntityManager,
  ) {}

  async create(createUserDto: CreateUserDto) {
    return await this.dataSource.transaction(async () => {
      console.log('Create data :::', createUserDto);
      const newUser = this.userRepo.create(createUserDto);
      return this.userRepo.save(newUser);
    });
  }

  async findAll() {
    // return await this.userRepo.query('SELECT * FROM user');
    return this.entityManager.find(User);
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
