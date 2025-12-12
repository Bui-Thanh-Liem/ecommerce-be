// src/auth/strategy/jwt-access.strategy.ts

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/modules/user/user.service';
import { ITokenPayload } from 'src/modules/token/token.service';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') || 'JWT_ACCESS_SECRET',
    });
  }

  // Payload là dữ liệu đã giải mã từ Access Token
  async validate(payload: ITokenPayload) {
    // Luôn kiểm tra người dùng từ DB để đảm bảo tài khoản còn hoạt động
    const user = await this.userService.findOne(payload.id);

    // if (!user || user.status === 'inactive') {
    //   throw new UnauthorizedException(
    //     'Access token is valid but user is inactive.',
    //   );
    // }

    // Trả về đối tượng người dùng đầy đủ. Sẽ được gắn vào req.user
    return user;
  }
}
