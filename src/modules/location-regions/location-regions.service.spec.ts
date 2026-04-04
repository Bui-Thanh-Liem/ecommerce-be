import { Test, TestingModule } from '@nestjs/testing';
import { LocationRegionsService } from './location-regions.service';

describe('LocationRegionsService', () => {
  let service: LocationRegionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocationRegionsService],
    }).compile();

    service = module.get<LocationRegionsService>(LocationRegionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
