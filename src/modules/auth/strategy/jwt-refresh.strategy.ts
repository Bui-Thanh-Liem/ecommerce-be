// src/auth/strategy/jwt-refresh.strategy.ts

import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { ITokenPayload } from 'src/modules/token/token.service';

// Hàm helper để trích xuất token từ cookie
const extractJwtFromCookie = (req: Request) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['refresh_token']; // Lấy từ cookie tên 'refresh_token'
  }
  return token;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: extractJwtFromCookie, // Trích xuất token từ Cookie
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_REFRESH_SECRET') || 'JWT_REFRESH_SECRET',
      passReqToCallback: true, // Quan trọng: cho phép truy cập request (để lấy cookie)
    });
  }

  // Thường không cần tìm kiếm DB ở đây. Logic kiểm tra RT trong DB sẽ ở Auth Service/Guard
  validate(req: Request, payload: ITokenPayload) {
    // Gắn Refresh Token vào payload để Auth Service có thể kiểm tra tính hợp lệ
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing.');
    }

    // Trả về payload + refresh token (sẽ gắn vào req.user)
    return { ...payload, refreshToken };
  }
}
