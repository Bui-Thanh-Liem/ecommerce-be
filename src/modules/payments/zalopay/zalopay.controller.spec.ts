import { Test, TestingModule } from '@nestjs/testing';
import { ZaloPayController } from './zalopay.controller';
import { ZaloPayService } from './zalopay.service';

describe('ZaloPayController', () => {
  let controller: ZaloPayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZaloPayController],
      providers: [ZaloPayService],
    }).compile();

    controller = module.get<ZaloPayController>(ZaloPayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
