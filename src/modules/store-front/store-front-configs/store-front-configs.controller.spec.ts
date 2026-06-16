import { Test, TestingModule } from '@nestjs/testing';
import { StoreFrontConfigsController } from './store-front-configs.controller';
import { StoreFrontConfigsService } from './store-front-configs.service';

describe('StoreFrontConfigsController', () => {
  let controller: StoreFrontConfigsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreFrontConfigsController],
      providers: [StoreFrontConfigsService],
    }).compile();

    controller = module.get<StoreFrontConfigsController>(StoreFrontConfigsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
