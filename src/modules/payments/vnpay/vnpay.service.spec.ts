import { Test, TestingModule } from '@nestjs/testing';
import { VnPayService } from './vnpay.service';

describe('VnPayService', () => {
  let service: VnPayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VnPayService],
    }).compile();

    service = module.get<VnPayService>(VnPayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
