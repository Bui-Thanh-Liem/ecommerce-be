import { Test, TestingModule } from '@nestjs/testing';
import { StoreFrontConfigsService } from './store-front-configs.service';

describe('StoreFrontConfigsService', () => {
  let service: StoreFrontConfigsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoreFrontConfigsService],
    }).compile();

    service = module.get<StoreFrontConfigsService>(StoreFrontConfigsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
