import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IJwtPayload } from '@/shared/interfaces/common/jwt-payload.interface';
import { CustomersService } from '@/modules/customer/customers/customers.service';
import { CustomerEntity } from '@/modules/customer/customers/entities/customer.entity';

// JWT Strategy để xác thực người dùng dựa trên token JWT
@Injectable()
export class JwtAuthCustomerStrategy extends PassportStrategy(Strategy, 'jwt-customer') {
  private readonly logger = new Logger(JwtAuthCustomerStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly customersService: CustomersService,
  ) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET_CUSTOMER');
    if (!secret) {
      throw new InternalServerErrorException('JWT_ACCESS_SECRET_CUSTOMER is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const token: string | null = (req.cookies as { e_token_customer?: string })?.e_token_customer ?? null;
          if (!token) {
            this.logger.error('Không tìm thấy token trong cookie');
            throw new UnauthorizedException();
          }
          return token;
        },
      ]),
      secretOrKey: secret,
    });
  }

  async validate(payload: IJwtPayload): Promise<CustomerEntity> {
    this.logger.debug('#2. JwtAuthCustomerStrategy - validate called with payload:', JSON.stringify(payload));

    // 0. Nếu payload không có customerId, chặn ngay tại đây
    if (!payload?.customerId) {
      this.logger.error('Payload không có customerId');
      throw new UnauthorizedException();
    }

    // 1. Check database xem customer còn tồn tại hay không
    const customer = await this.customersService.findOne(payload?.customerId);

    // 2. Nếu không thấy, chặn ngay tại đây
    if (!customer) {
      this.logger.error('Không tìm thấy customer với ID từ payload');
      throw new UnauthorizedException();
    }

    // 3. Nếu OK, trả về customer. Object này sẽ được truyền vào handleRequest
    return customer;
  }
}
