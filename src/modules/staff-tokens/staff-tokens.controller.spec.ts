import { Test, TestingModule } from '@nestjs/testing';
import { StaffTokensController } from './staff-tokens.controller';
import { StaffTokensService } from './staff-tokens.service';

describe('StaffTokensController', () => {
  let controller: StaffTokensController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffTokensController],
      providers: [StaffTokensService],
    }).compile();

    controller = module.get<StaffTokensController>(StaffTokensController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
