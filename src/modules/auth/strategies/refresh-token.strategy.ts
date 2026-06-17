import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IJwtPayload } from '@/shared/interfaces/common/jwt-payload.interface';
import { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh-token') {
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new BadRequestException('JWT_REFRESH_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const token: string | null = (req.cookies as { e_refresh_token?: string })?.e_refresh_token ?? null;
          if (!token) {
            throw new UnauthorizedException();
          }
          return token;
        },
      ]),
      secretOrKey: secret,
    });
  }

  validate(payload: IJwtPayload): IJwtPayload {
    return payload;
  }
}
