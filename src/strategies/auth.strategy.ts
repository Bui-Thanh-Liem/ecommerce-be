import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IJwtPayload } from '@/shared/interfaces/common/jwt-payload.interface';
import { StaffsService } from '@/modules/management/staffs/staffs.service';
import { StaffEntity } from '@/modules/management/staffs/entities/staff.entity';

// JWT Strategy để xác thực người dùng dựa trên token JWT
@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtAuthStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly staffService: StaffsService,
  ) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET');
    if (!secret) {
      throw new InternalServerErrorException('JWT_ACCESS_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const token: string | null = (req.cookies as { e_token?: string })?.e_token ?? null;
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

  async validate(payload: IJwtPayload): Promise<StaffEntity> {
    this.logger.debug('#2. JwtAuthStrategy - validate called with payload:', JSON.stringify(payload));

    // 1. Check database xem staff còn tồn tại hay không
    const staff = await this.staffService.findOne(payload?.staffId);

    // 2. Nếu không thấy, chặn ngay tại đây
    if (!staff) {
      this.logger.error('Không tìm thấy staff với ID từ payload');
      throw new UnauthorizedException();
    }

    // 3. Nếu OK, trả về staff. Object này sẽ được truyền vào handleRequest
    return staff;
  }
}
