import { CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { StaffEntity } from 'src/modules/staffs/entities/staff.entity';

export class RoleGuard implements CanActivate {
  private readonly logger = new Logger(RoleGuard.name);

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const staff = req.user as StaffEntity;
    this.logger.debug('Validating staff role:::', staff && staff.isAdmin === true);
    return staff && staff.isAdmin === true;
  }
}
