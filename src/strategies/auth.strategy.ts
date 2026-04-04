import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { StaffsService } from 'src/modules/staffs/staffs.service';
import { IJwtPayload } from 'src/shared/interfaces/jwt-payload.interface';

// chỉ sử dụng jwt hoặc cookie session, không nên dùng cả 2 (hiện tại là học)
@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtAuthStrategy.name);

  constructor(
    private configService: ConfigService,
    private userService: StaffsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          let token: string | null = null;

          if (req.session?.token) {
            token = req.session.token;
          }

          this.logger.debug('Extracting JWT from session:::', token);
          return token;
        },
      ]),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      secretOrKey: configService.get('JWT_SECRET') || 'key-secret',
    });
  }

  async validate(payload: IJwtPayload): Promise<unknown> {
    // check in database (cached) if user exists and is valid
    const user = await this.userService.findOne(payload.userId);
    if (!user?.id) throw new UnauthorizedException('Invalid token');

    //
    this.logger.debug('Validating JWT payload:::', payload);
    return {
      id: user.id,
      email: user.email,
    };
  }
}
