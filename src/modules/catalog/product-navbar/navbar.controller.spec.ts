import { Test, TestingModule } from '@nestjs/testing';
import { NavbarController } from './product-navbar.controller';
import { NavbarService } from './product-navbar.service';

describe('NavbarController', () => {
  let controller: NavbarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NavbarController],
      providers: [NavbarService],
    }).compile();

    controller = module.get<NavbarController>(NavbarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
