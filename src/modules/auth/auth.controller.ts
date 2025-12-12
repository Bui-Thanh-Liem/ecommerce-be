import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { OvResult } from 'src/interceptors/ov.interceptor';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { User } from '../user/entities/user.entity';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { Public } from 'src/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Login existing user
  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(
    @Req() req: Request,
    @Body() body: LoginDto,
    @Headers('user-agent') deviceInfo: string,
    @Headers('x-forwarded-for') ipAddress: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<OvResult> {
    // Call auth service to login
    const { tokens, user } = await this.authService.login({
      userLogged: req.user as User,
      deviceInfo,
      ipAddress,
    });

    // Set refresh token in HttpOnly cookie
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true, // Không thể truy cập bằng JS (chống XSS)
      secure: true, // Chỉ gửi qua HTTPS (bắt buộc trong Prod)
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    // Return access token & user info
    return {
      metadata: { tokens, user },
    };
  }

  // Refresh token
  @Post('refresh-token')
  @UseGuards(JwtRefreshGuard)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    const tokens = await this.authService.refreshToken(refreshToken);

    // Set refresh token in HttpOnly cookie
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true, // Không thể truy cập bằng JS (chống XSS)
      secure: true, // Chỉ gửi qua HTTPS (bắt buộc trong Prod)
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return {
      metadata: tokens,
    };
  }

  //
  @Post('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    // 1. Thu hồi RT trong DB
    await this.authService.logout(req.user.id);

    // 2. Xóa RT khỏi Cookie
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return { message: 'Logout successful' };
  }
}
