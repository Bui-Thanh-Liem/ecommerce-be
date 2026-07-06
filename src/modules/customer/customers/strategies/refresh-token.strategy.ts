import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IJwtPayload } from '@/shared/interfaces/common/jwt-payload.interface';
import { Request } from 'express';

@Injectable()
export class RefreshTokenCustomerStrategy extends PassportStrategy(Strategy, 'refresh-token-customer') {
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('JWT_REFRESH_SECRET_CUSTOMER');
    if (!secret) {
      throw new BadRequestException('JWT_REFRESH_SECRET_CUSTOMER is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return (req.cookies as { e_refresh_token_customer?: string })?.e_refresh_token_customer ?? null;
        },
      ]),
      secretOrKey: secret,
    });
  }

  validate(payload: IJwtPayload): IJwtPayload {
    return payload;
  }
}
