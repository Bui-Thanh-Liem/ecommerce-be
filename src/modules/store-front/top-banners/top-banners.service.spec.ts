import { Test, TestingModule } from '@nestjs/testing';
import { TopBannersService } from './top-banners.service';

describe('TopBannersService', () => {
  let service: TopBannersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TopBannersService],
    }).compile();

    service = module.get<TopBannersService>(TopBannersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
