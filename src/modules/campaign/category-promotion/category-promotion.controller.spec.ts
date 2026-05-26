import { Test, TestingModule } from '@nestjs/testing';
import { CategoryPromotionController } from './category-promotion.controller';
import { CategoryPromotionService } from './category-promotion.service';

describe('CategoryPromotionController', () => {
  let controller: CategoryPromotionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryPromotionController],
      providers: [CategoryPromotionService],
    }).compile();

    controller = module.get<CategoryPromotionController>(CategoryPromotionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
