import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorator';
import { IStaff } from 'src/shared/interfaces/models/staff.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  handleRequest(err, staff, info, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());

    // Nếu route được đánh dấu là public, bỏ qua việc kiểm tra token
    if (isPublic) {
      return true; // Cho phép truy cập mà không cần token
    }

    if (err || !staff) {
      throw new UnauthorizedException(info || 'Unauthorized');
    }

    // Thay vì để mặc định gán vào req.user, ta gán vào req.staff
    request.staff = staff as IStaff;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return staff;
  }
}
