import { Test, TestingModule } from '@nestjs/testing';
import { TopBannersController } from './top-banners.controller';
import { TopBannersService } from './top-banners.service';

describe('TopBannersController', () => {
  let controller: TopBannersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TopBannersController],
      providers: [TopBannersService],
    }).compile();

    controller = module.get<TopBannersController>(TopBannersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
