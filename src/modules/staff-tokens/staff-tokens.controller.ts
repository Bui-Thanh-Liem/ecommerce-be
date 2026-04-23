import { Controller, Get } from '@nestjs/common';
import { StaffTokensService } from './staff-tokens.service';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { StaffTokenDto } from './dto/staff-token-token.dto';

@Controller('staff-tokens')
@Serializer(StaffTokenDto)
export class StaffTokensController {
  constructor(private readonly staffTokensService: StaffTokensService) {}

  @Get()
  findAll() {
    return this.staffTokensService.findAll();
  }
}
