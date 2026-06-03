import { ICustomer } from '@/shared/interfaces/models/customer.interface';
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

//
@Injectable()
export class LocalAuthGuard extends AuthGuard('local-customer') {
  // Ghi đè hàm này để đổi tên thuộc tính trong Request
  handleRequest(err, customer, info, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    if (err || !customer) {
      throw new UnauthorizedException(err || 'Unauthorized');
    }

    // Thay vì để mặc định gán vào req.user, ta gán vào req.customer
    request.customer = customer as ICustomer;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return customer;
  }
}
