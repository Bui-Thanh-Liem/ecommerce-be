import { Controller, Get } from '@nestjs/common';
import { StaffTokensService } from './staff-tokens.service';

@Controller('staff-tokens')
export class StaffTokensController {
  constructor(private readonly staffTokensService: StaffTokensService) {}

  @Get()
  findAll() {
    return this.staffTokensService.findAll();
  }
}
