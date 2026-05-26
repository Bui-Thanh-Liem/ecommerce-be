import { Test, TestingModule } from '@nestjs/testing';
import { NavbarService } from './product-navbar.service';

describe('NavbarService', () => {
  let service: NavbarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NavbarService],
    }).compile();

    service = module.get<NavbarService>(NavbarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
