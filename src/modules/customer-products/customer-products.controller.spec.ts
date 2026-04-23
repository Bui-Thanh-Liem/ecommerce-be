import { Test, TestingModule } from '@nestjs/testing';
import { CustomerProductsController } from './customer-products.controller';
import { CustomerProductsService } from './customer-products.service';

describe('CustomerProductsController', () => {
  let controller: CustomerProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerProductsController],
      providers: [CustomerProductsService],
    }).compile();

    controller = module.get<CustomerProductsController>(CustomerProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
