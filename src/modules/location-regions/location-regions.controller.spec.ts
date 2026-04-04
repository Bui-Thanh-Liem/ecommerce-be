import { Test, TestingModule } from '@nestjs/testing';
import { LocationRegionsController } from './location-regions.controller';
import { LocationRegionsService } from './location-regions.service';

describe('LocationRegionsController', () => {
  let controller: LocationRegionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationRegionsController],
      providers: [LocationRegionsService],
    }).compile();

    controller = module.get<LocationRegionsController>(LocationRegionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
