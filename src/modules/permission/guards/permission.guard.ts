import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PERMISSION_KEY } from 'src/decorators/permission.decorator';
import { User } from 'src/modules/user/entities/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    // Lấy danh sách permissions yêu cầu từ metadata của route handler
    const required = this.reflector.get<string[]>(
      IS_PERMISSION_KEY,
      ctx.getHandler(),
    );
    if (!required || required.length === 0) return true;

    // Lấy request từ context
    const req = ctx.switchToHttp().getRequest();

    // Lấy danh sách permissions của user từ các role
    const user = req.user as User;
    const userPermissions = user.roleIds.flatMap((r) =>
      r.permissions.map((p) => `${p.resource}:${p.action}`),
    );

    // Kiểm tra xem user có đủ permissions hay không
    return required.every((p) => userPermissions.includes(p));
  }
}
