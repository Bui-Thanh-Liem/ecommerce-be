import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorator';

@Injectable()
export class JwtAccessGuard extends AuthGuard('jwt-access') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // 1. Kiểm tra xem route hiện tại có decorator @Public() không
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // kiểm tra trên method (hàm)
      context.getClass(), // kiểm tra trên class (controller)
    ]);

    // 2. Nếu là Public, BỎ QUA việc kiểm tra JWT và cho phép truy cập
    if (isPublic) {
      return true;
    }

    // 3. Nếu không phải Public, tiếp tục thực thi logic kiểm tra JWT (super.canActivate)
    return super.canActivate(context);
  }
}
