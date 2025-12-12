import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hashPassword } from 'src/utils/crypto';
import { EntityManager, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    private entityManager: EntityManager,
  ) {}

  // Create new user
  async create(body: CreateUserDto) {
    const { email, username, password, phone } = body;

    // 1. Check if user already exists
    const existingUser = await this.userRepo.findOne({
      where: [{ email }, { username }, { phone }],
    });
    if (existingUser) {
      throw new HttpException('User already exists', 200);
    }

    // 2. hash password
    const passwordHashed = hashPassword(password);

    // 3. Create new user
    const newUser = this.userRepo.create({
      ...body,
      password: passwordHashed,
    });
    await this.userRepo.save(newUser);

    //
    return newUser;
  }

  async findAll() {
    // return await this.userRepo.query('SELECT * FROM user');
    const users = await this.userRepo.find({
      select: { password: false },
    });
    return { metadata: users };
  }

  async findOne(id: string) {
    return await this.userRepo.findOne({
      where: { id },
    });
  }

  async findOneByEmail(email: string) {
    return await this.userRepo.findOne({
      where: { email },
    });
  }

  update(id: string, body: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
