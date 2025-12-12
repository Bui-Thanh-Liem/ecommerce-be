import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hashPassword } from 'src/utils/crypto';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { excludeFields } from 'src/utils/lodash';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {
    this.initAdmin();
  }

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
    const savedUser = await this.userRepo.save(newUser);

    // 4. Return new user
    return excludeFields(savedUser, ['password']);
  }

  async findAll() {
    // return await this.userRepo.query('SELECT * FROM user');
    const users = await this.userRepo.find();
    return users;
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
    });
    return user;
  }

  // Find user by email for auth service
  async findOneForAuth(email: string) {
    return await this.userRepo.findOne({
      where: { email },
      relations: { roleIds: true },
      select: { email: true, password: true, id: true, username: true },
    });
  }

  update(id: string, body: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }

  async initAdmin() {
    // Create admin user if not exists
    const adminEmail = 'admin@gmail.com';
    const existingAdmin = await this.userRepo.findOne({
      where: { email: adminEmail },
    });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = this.userRepo.create({
      email: adminEmail,
      username: 'admin',
      phone: '0123456789',
      password: hashPassword('Admin@123'),
    });
    await this.userRepo.save(adminUser);
    console.log('Admin user created');
  }
}
