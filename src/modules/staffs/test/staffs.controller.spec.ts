import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UsersController } from '../staffs.controller';
import { UsersService } from '../staffs.service';

describe('UsersController', () => {
  let controller: UsersController;

  const _userService: Partial<UsersService> = {
    findOne: jest.fn().mockImplementation((id) =>
      Promise.resolve({
        id,
        email: 'test@test.com',
      }),
    ),
  };

  const _authService: Partial<AuthService> = {
    signIn: jest.fn().mockImplementation((id) =>
      Promise.resolve({
        id,
        email: 'test@test.com',
      }),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: _userService,
        },
        {
          provide: AuthService,
          useValue: _authService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('find user throw error if user not found', async () => {
    // Override
    _userService.findOne = jest.fn().mockResolvedValueOnce(null);

    //
    await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
  });
});
