import { Test, TestingModule } from '@nestjs/testing';
import { MarketingProgramsController } from './marketing-programs.controller';
import { MarketingProgramsService } from './marketing-programs.service';

describe('MarketingProgramsController', () => {
  let controller: MarketingProgramsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketingProgramsController],
      providers: [MarketingProgramsService],
    }).compile();

    controller = module.get<MarketingProgramsController>(MarketingProgramsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
