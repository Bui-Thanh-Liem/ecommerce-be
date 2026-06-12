import { Test, TestingModule } from '@nestjs/testing';
import { MarketingProgramsService } from './marketing-programs.service';

describe('MarketingProgramsService', () => {
  let service: MarketingProgramsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketingProgramsService],
    }).compile();

    service = module.get<MarketingProgramsService>(MarketingProgramsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
