import { Test, TestingModule } from '@nestjs/testing';
import { CategoryPromotionService } from './category-promotion.service';

describe('CategoryPromotionService', () => {
  let service: CategoryPromotionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryPromotionService],
    }).compile();

    service = module.get<CategoryPromotionService>(CategoryPromotionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
