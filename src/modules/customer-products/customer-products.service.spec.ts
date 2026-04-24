import { Test, TestingModule } from '@nestjs/testing';
import { CustomerProductsService } from './customer-products.service';

describe('CustomerProductsService', () => {
  let service: CustomerProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerProductsService],
    }).compile();

    service = module.get<CustomerProductsService>(CustomerProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
