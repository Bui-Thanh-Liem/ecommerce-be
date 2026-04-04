import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../staffs/staffs.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../staffs/entities/staff.entity';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  // Mock UsersService
  const _userService: Partial<UsersService> = {
    create: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 1, ...dto })),
    findByEmail: jest.fn().mockResolvedValue({
      id: 1,
      email: '',
      password: '',
    }),
  };

  //
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: _userService,
        },
      ],
    }).compile();

    // Khởi tạo lại service từ module vừa compile
    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  // ===== Case: AuthService is defined =====
  it('should be defined - AuthService', () => {
    expect(service).toBeDefined();
  });

  // ===== Case: UsersService is defined =====
  it('should be defined - UsersService', () => {
    expect(usersService).toBeDefined();
  });

  // ===== Case: User already exists =====
  it('throw error if user already exists', async () => {
    // Override
    _userService.findByEmail = jest.fn().mockImplementationOnce(
      (dto) =>
        ({
          id: 1,
          ...dto,
        }) as UserEntity,
    );

    await expect(service.singUp('test@test.com', 'password')).rejects.toThrow(ConflictException);
  });

  // ==== Case: Ensure password is hashed =====
  it('should hash the password before saving', async () => {
    // Override
    _userService.findByEmail = jest.fn().mockResolvedValue(null);

    //
    const newUser = await service.singUp('test2@test.com', 'password');
    expect(newUser.user.password).not.toEqual('password');
  });

  // ==== Case: Invalid credentials =====
  it('should throw an error if credentials are invalid', async () => {
    // Override
    _userService.findByEmail = jest.fn().mockImplementationOnce((dto) => ({
      id: 1,
      email: dto.email,
      password: 'password', // Mocked hashed password
    }));

    await expect(service.signIn({})).rejects.toThrow(UnauthorizedException);
  });

  // ==== Case: Valid credentials =====
  it('should return user if credentials are valid', async () => {
    // // Override
    _userService.findByEmail = jest.fn().mockResolvedValueOnce({
      id: 1,
      email: 'test@test.com',
      password: '$2b$10$VSAlo.MXr5EFtwm1JU00Detm1N4WVQtXRHvi5r4LlsZsp1O2LVFLK',
    });

    //
    const user = await service.signIn({});
    expect(user).toBeDefined();
  });
});
