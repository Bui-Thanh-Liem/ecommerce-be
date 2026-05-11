import { Test, TestingModule } from '@nestjs/testing';
import { TeamCategoriesController } from './team-categories.controller';
import { TeamCategoriesService } from './team-categories.service';

describe('TeamCategoriesController', () => {
  let controller: TeamCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamCategoriesController],
      providers: [TeamCategoriesService],
    }).compile();

    controller = module.get<TeamCategoriesController>(TeamCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
