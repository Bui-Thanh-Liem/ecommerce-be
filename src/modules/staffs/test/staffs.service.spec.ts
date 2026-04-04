import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../staffs.service';
import { UserEntity } from '../entities/staff.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from '../dto/create-staff.dto';
import { UpdateUserDto } from '../dto/update-staff.dto';

describe('UsersService', () => {
  let service: UsersService;

  // Mock repository
  const _userRepository = {
    create: jest.fn().mockImplementation((dto: CreateUserDto) => dto),
    save: jest.fn().mockImplementation((user) => Promise.resolve({ id: 1, ...user })),
    findOneBy: jest
      .fn()
      .mockImplementation(({ email }: { email: string }) => Promise.resolve({ id: 1, email, password: 'hashed' })),
    find: jest.fn().mockResolvedValue([]),
    merge: jest.fn().mockImplementation(
      (user, dto: UpdateUserDto): Promise<UserEntity | null> => ({
        ...user,
        ...dto,
      }),
    ),
    remove: jest.fn().mockResolvedValue({ id: 1 }),
  };

  //
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: _userRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find a user by email', async () => {
    await expect(service.findByEmail('test@test.com')).resolves.toEqual({
      id: 1,
      email: 'test@test.com',
      password: 'hashed',
    });
  });
});
