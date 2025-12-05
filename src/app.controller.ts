import { Controller, Get, HostParam, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ValidatePipe } from './pipe/validate/validate.pipe';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@HostParam() host: string): string {
    console.log(host);

    return this.appService.getHello() + ' from ' + host;
  }

  @Get('test')
  getNumber(@Query('value', ValidatePipe) value: number): number {
    return 123;
  }
}
