import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ValidatePipe } from './pipe/validate/validate.pipe';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test')
  getNumber(@Query('value', ValidatePipe) value: number): number {
    return 123;
  }
}
