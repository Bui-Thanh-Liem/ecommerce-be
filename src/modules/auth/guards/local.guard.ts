import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IStaff } from '@/shared/interfaces/models/staff.interface';

//
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  // Ghi đè hàm này để đổi tên thuộc tính trong Request
  handleRequest(err, staff, info, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    if (err || !staff) {
      throw new UnauthorizedException(info || 'Unauthorized');
    }

    // Thay vì để mặc định gán vào req.user, ta gán vào req.staff
    request.staff = staff as IStaff;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return staff;
  }
}
