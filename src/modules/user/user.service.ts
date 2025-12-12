import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hashPassword } from 'src/utils/crypto';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { excludeFields } from 'src/utils/lodash';
import { RoleService } from '../roles/role.service';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private roleService: RoleService,
  ) {
    this.initAdmin().catch((err) => {
      throw new InternalServerErrorException(
        'Failed to initialize admin user',
        err,
      );
    });
  }

  // Create new user
  async create(body: CreateUserDto) {
    const { email, username, password, phone, roleIds } = body;

    // 1. Check if user already exists
    console.log('body :::', body);
    const existingUser = await this.userRepo.findOne({
      where: [{ email }, { username }, { phone }],
    });
    if (existingUser) {
      throw new HttpException('User already exists', 200);
    }

    // 2. Find roles
    let roles: Role[] | null = null;
    if (roleIds && roleIds.length > 0) {
      roles = await this.roleService.findByIds(roleIds);
      if (roles.length !== roleIds.length) {
        throw new HttpException('Some roles are invalid', 200);
      }
    }

    // 3. hash password
    const passwordHashed = hashPassword(password);

    // 4. Create new user
    const newUser = this.userRepo.create({
      email,
      phone,
      username,
      password: passwordHashed,
      roleIds: (roles as Role[]) || [],
    });
    const savedUser = await this.userRepo.save(newUser);

    // 4. Return new user
    return excludeFields(savedUser, ['password']);
  }

  async findAll() {
    return await this.userRepo.find({ relations: { roleIds: true } });
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: { roleIds: true },
    });
    return user;
  }

  // Find user by email for auth service
  async findOneForAuth(email: string) {
    return await this.userRepo.findOne({
      where: { email },
      relations: { roleIds: true },
      select: {
        id: true,
        email: true,
        isAdmin: true,
        username: true,
        password: true,
        isActive: true,
      },
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
      isAdmin: true,
      password: hashPassword('Admin@123'),
    });
    await this.userRepo.save(adminUser);
    console.log('Admin user created');
  }
}
