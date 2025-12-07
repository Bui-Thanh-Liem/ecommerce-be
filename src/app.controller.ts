import { Controller, Get, Headers, Logger, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ValidatePipe } from './pipe/validate/validate.pipe';

@Controller()
export class AppController {
  private logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Headers('host') host: string) {
    return 'Hello from ' + host;
  }

  @Get('test')
  getNumber(@Query('value', ValidatePipe) value: number): number {
    return 123;
  }
}
