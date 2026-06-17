import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { CookieOptions, Request, Response } from 'express';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { CurrentStaff } from '../../decorators/current-staff.decorator';
import { AuthService } from './auth.service';
import { AuthDto } from './dtos/auth.dto';
import { SigninStaffDto } from './dtos/signin-staff.dto';
import { LocalAuthGuard } from './guards/local.guard';
import { Public } from '@/decorators/public.decorator';
import { StaffEntity } from '../management/staffs/entities/staff.entity';
import { Throttle } from '@nestjs/throttler';
import { RefreshTokenAuthGuard } from './guards/refresh-token.guard';
import { GetJwtPayload } from '@/decorators/get-jwt-payload.decorator';
import { type IJwtPayload } from '@/shared/interfaces/common/jwt-payload.interface';

@Controller('auth')
@Serializer(AuthDto)
export class AuthController {
  private readonly defaultConfig: CookieOptions = {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  };

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Giới hạn 5 yêu cầu mỗi phút cho endpoint login
  @Post('signin')
  @UseGuards(LocalAuthGuard)
  async signIn(
    @Body() signInDto: SigninStaffDto, // Giữ lại cho ValidationPipe - Swagger
    @CurrentStaff() currentStaff: StaffEntity,
    // eslint-disable-next-line max-len
    @Res({ passthrough: true }) res: Response, // nếu không có passthrough, thì phải dùng res.json() để trả về response, còn có thì vẫn trả về object bình thường và Nest sẽ tự chuyển thành response (có interceptor)
  ) {
    const { staff, accessToken, refreshToken } = await this.authService.signIn(currentStaff);

    //
    res.cookie('e_token', accessToken, { ...this.defaultConfig }); // 15 phút
    res.cookie('e_refresh_token', refreshToken, { ...this.defaultConfig, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 30 ngày

    return { staff };
  }

  @Public()
  @Throttle({ default: { limit: 1, ttl: 900000 } }) // Giới hạn 1 yêu cầu mỗi 15 phút cho endpoint refresh-token
  @Post('refresh-token')
  @UseGuards(RefreshTokenAuthGuard)
  async refreshToken(
    @Req() request: Request,
    @GetJwtPayload() jwtPayload: IJwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = request.cookies['e_refresh_token'] as string;

    //
    const { access, refresh } = await this.authService.refreshToken(refreshToken, jwtPayload);

    //
    const refreshMaxAge = Math.floor(jwtPayload.exp! - Date.now() / 1000) * 1000; // ms
    res.cookie('e_token', access, { ...this.defaultConfig }); // 15 phút
    res.cookie('e_refresh_token', refresh, { ...this.defaultConfig, maxAge: refreshMaxAge });

    return true;
  }

  @Public()
  @Post('signout')
  @UseGuards(RefreshTokenAuthGuard)
  async signOut(@Res({ passthrough: true }) res: Response, @GetJwtPayload() jwtPayload: IJwtPayload) {
    await this.authService.signOut(jwtPayload.staffId!);
    res.clearCookie('e_token');
    res.clearCookie('e_refresh_token');
    return true;
  }

  @Get('whoami')
  whoami(@CurrentStaff() staff: StaffEntity) {
    return { staff };
  }
}
