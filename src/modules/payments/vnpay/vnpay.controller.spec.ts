import { Test, TestingModule } from '@nestjs/testing';
import { VnPayController } from './vnpay.controller';
import { VnPayService } from './vnpay.service';

describe('VnPayController', () => {
  let controller: VnPayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VnPayController],
      providers: [VnPayService],
    }).compile();

    controller = module.get<VnPayController>(VnPayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
