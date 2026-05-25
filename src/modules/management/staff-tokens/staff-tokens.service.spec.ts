import { Test, TestingModule } from '@nestjs/testing';
import { StaffTokensService } from './staff-tokens.service';

describe('StaffTokensService', () => {
  let service: StaffTokensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StaffTokensService],
    }).compile();

    service = module.get<StaffTokensService>(StaffTokensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
