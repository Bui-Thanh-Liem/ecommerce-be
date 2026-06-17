import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class RefreshTokenAuthGuard extends AuthGuard('refresh-token') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err, payload, info, context: ExecutionContext) {
    const res = context.switchToHttp().getRequest<Response>();

    // Nếu có lỗi hoặc không tìm thấy staff, trả về lỗi Unauthorized
    if (err || !payload) {
      res.clearCookie('e_token');
      res.clearCookie('e_refresh_token');
      throw new UnauthorizedException();
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return payload;
  }
}
