import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PERMISSION_KEY } from 'src/decorators/permission.decorator';
import { User } from 'src/modules/user/entities/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    // Lấy danh sách permissions yêu cầu từ metadata của route handler
    const requiredPermissions = this.reflector.get<string[]>(
      IS_PERMISSION_KEY,
      ctx.getHandler(),
    );
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    console.log('requiredPermissions:::', requiredPermissions);

    // Lấy request từ context
    const req = ctx.switchToHttp().getRequest<Request>();

    // Lấy user từ request
    const user = req.user as User;
    console.log('isAdmin:::', user.isAdmin);

    // Nếu là admin thì luôn có quyền
    if (user.isAdmin) return true;

    // Lấy danh sách permissions của user từ các role
    const userPermissions = user.roleIds.flatMap((r) =>
      r.permissions.map((p) => p.code),
    );
    console.log('userPermissions:::', userPermissions);

    // Kiểm tra xem user có đủ permissions hay không
    return requiredPermissions.every((p) => userPermissions.includes(p));
  }
}
