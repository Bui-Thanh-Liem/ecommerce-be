import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '@/decorators/public.decorator';
import { Observable } from 'rxjs';
import { IS_CUSTOMER_KEY } from '@/decorators/customer.decorator';
import { CustomerEntity } from '@/modules/customer/customers/entities/customer.entity';

@Injectable()
export class JwtAuthCustomerGuard extends AuthGuard('jwt-customer') {
  private readonly logger = new Logger(JwtAuthCustomerGuard.name);

  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());
    const isCustomer = this.reflector.get<boolean>(IS_CUSTOMER_KEY, context.getHandler());

    // Cho phép truy cập mà không cần token
    // Chỉ xử lý các route của customer
    if (isPublic || !isCustomer) return true;

    //
    this.logger.debug('#1. JwtAuthCustomerGuard - canActivate called');
    return super.canActivate(context);
  }

  handleRequest(err, customer, info: any, context: ExecutionContext) {
    this.logger.debug('#3. JwtAuthCustomerGuard - handleRequest called');
    const request = context.switchToHttp().getRequest<Request>();

    // Nếu có lỗi hoặc không tìm thấy customer, trả về lỗi Unauthorized
    if (err || !customer) {
      this.logger.error(info || 'Unauthorized');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (info?.name === 'TokenExpiredError' && info?.message === 'jwt expired') {
        throw new UnauthorizedException('TokenCustomerExpiredError');
      }

      //
      throw new UnauthorizedException('Unauthorized Customer');
    }

    // Thay vì để mặc định gán vào req.user, ta gán vào req.customer
    request.customer = customer as CustomerEntity;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return customer;
  }
}
