import { Test, TestingModule } from '@nestjs/testing';
import { ZaloPayService } from './zalopay.service';

describe('ZaloPayService', () => {
  let service: ZaloPayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZaloPayService],
    }).compile();

    service = module.get<ZaloPayService>(ZaloPayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
