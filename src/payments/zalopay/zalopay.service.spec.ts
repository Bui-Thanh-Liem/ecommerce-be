import { Test, TestingModule } from '@nestjs/testing';
import { ZalopayService } from './zalopay.service';

describe('ZalopayService', () => {
  let service: ZalopayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZalopayService],
    }).compile();

    service = module.get<ZalopayService>(ZalopayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
