import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '@/decorators/public.decorator';
import { IStaff } from '@/shared/interfaces/models/staff.interface';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());
    if (isPublic) {
      return true; // Cho phép truy cập mà không cần token
    }
    this.logger.debug('#1. JwtAuthGuard - canActivate called');
    return super.canActivate(context);
  }

  handleRequest(err, staff, info, context: ExecutionContext) {
    this.logger.debug('#3. JwtAuthGuard - handleRequest called');
    const request = context.switchToHttp().getRequest<Request>();

    // Nếu có lỗi hoặc không tìm thấy staff, trả về lỗi Unauthorized
    if (err || !staff) {
      throw new UnauthorizedException(info || 'Unauthorized');
    }

    // Thay vì để mặc định gán vào req.user, ta gán vào req.staff
    request.staff = staff as IStaff;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return staff;
  }
}
