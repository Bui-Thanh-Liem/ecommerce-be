import { Test, TestingModule } from '@nestjs/testing';
import { SepayService } from './sepay.service';

describe('SepayService', () => {
  let service: SepayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SepayService],
    }).compile();

    service = module.get<SepayService>(SepayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
