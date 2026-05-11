import { Test, TestingModule } from '@nestjs/testing';
import { TeamCategoriesService } from './team-categories.service';

describe('TeamCategoriesService', () => {
  let service: TeamCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamCategoriesService],
    }).compile();

    service = module.get<TeamCategoriesService>(TeamCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
