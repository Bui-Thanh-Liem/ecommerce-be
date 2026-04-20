import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { Permissions } from '@/decorators/permission.decorator';
import { IS_PUBLIC_KEY } from '@/decorators/public.decorator';
import { StaffEntity } from '@/modules/staffs/entities/staff.entity';

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger = new Logger(RoleGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    //
    const staff = req.staff as StaffEntity;
    const permissionCodeRequired = this.reflector.get<string>(Permissions, context.getHandler());
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());

    // Cho phép truy cập mà không cần kiểm tra quyền
    if (isPublic || staff?.isAdmin) return true;

    // Nếu có permissionsRequired, kiểm tra xem staff có quyền hay không
    const permissions = staff.roles.flatMap((role) => role.permissions);
    const permissionCodes = permissions.map((p) => p.code);
    this.logger.debug('permissionCodes:', JSON.stringify(permissionCodes));
    this.logger.debug('Permission code required:', permissionCodeRequired);

    // Nếu permissionCodeRequired không được định nghĩa, cho phép truy cập
    const hasPermission = permissionCodes.some((code) => code === permissionCodeRequired);
    if (!hasPermission) {
      this.logger.warn(`Access denied for staff ${staff.id} - Missing permission: ${permissionCodeRequired}`);
    }
    return hasPermission;

    //
    return false;
  }
}
