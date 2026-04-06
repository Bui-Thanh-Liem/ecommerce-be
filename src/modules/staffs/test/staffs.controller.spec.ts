import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StaffsController } from '../staffs.controller';
import { StaffsService } from '../staffs.service';
import { AuthService } from '@/modules/auth/auth.service';

describe('StaffsController', () => {
  let controller: StaffsController;

  const _staffService: Partial<StaffsService> = {
    findOne: jest.fn().mockImplementation((id: string) =>
      Promise.resolve({
        id,
        email: 'test@test.com',
      }),
    ),
  };

  const _authService: Partial<AuthService> = {
    signIn: jest.fn().mockImplementation((id: string) =>
      Promise.resolve({
        id,
        email: 'test@test.com',
      }),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffsController],
      providers: [
        {
          provide: StaffsService,
          useValue: _staffService,
        },
        {
          provide: AuthService,
          useValue: _authService,
        },
      ],
    }).compile();

    controller = module.get<StaffsController>(StaffsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('find staff throw error if staff not found', async () => {
    // Override
    _staffService.findOne = jest.fn().mockResolvedValueOnce(null);

    //
    await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
  });
});
