import { Controller, Get } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { IOvResult } from 'src/interceptors/ov.interceptor';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  async findAll(): Promise<IOvResult> {
    return {
      metadata: await this.permissionService.findAll(),
    };
  }
}
