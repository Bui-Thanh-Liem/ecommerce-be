import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { StaffsService } from '@/modules/staffs/staffs.service';
import { IJwtPayload } from '@/shared/interfaces/jwt-payload.interface';
import { StaffEntity } from '@/modules/staffs/entities/staff.entity';

// JWT Strategy để xác thực người dùng dựa trên token JWT
@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtAuthStrategy.name);

  constructor(
    private configService: ConfigService,
    private staffService: StaffsService,
  ) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET');
    if (!secret) {
      throw new BadRequestException('JWT_ACCESS_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const token: string | null = (req.cookies as { token?: string })?.token ?? null;
          if (!token) {
            this.logger.error('Không tìm thấy token trong cookie');
            throw new UnauthorizedException('No token found in cookies');
          }
          return token;
        },
      ]),
      secretOrKey: secret,
    });
  }

  async validate(payload: IJwtPayload): Promise<StaffEntity> {
    this.logger.debug('#2. JwtAuthStrategy - validate called');

    // 1. Check database xem staff còn tồn tại hay không
    const staff = await this.staffService.findOne(payload.staffId);

    // 2. Nếu không thấy, chặn ngay tại đây
    if (!staff) {
      throw new UnauthorizedException('Staff not found');
    }

    // 3. Nếu OK, trả về staff. Object này sẽ được truyền vào handleRequest
    return staff;
  }
}
