import { Test, TestingModule } from '@nestjs/testing';
import { MoMoController } from './momo.controller';
import { MoMoService } from './momo.service';

describe('MoMoController', () => {
  let controller: MoMoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoMoController],
      providers: [MoMoService],
    }).compile();

    controller = module.get<MoMoController>(MoMoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
