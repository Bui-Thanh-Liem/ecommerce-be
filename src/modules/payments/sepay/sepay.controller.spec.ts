import { Test, TestingModule } from '@nestjs/testing';
import { SepayController } from './sepay.controller';
import { SepayService } from './sepay.service';

describe('SepayController', () => {
  let controller: SepayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SepayController],
      providers: [SepayService],
    }).compile();

    controller = module.get<SepayController>(SepayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
