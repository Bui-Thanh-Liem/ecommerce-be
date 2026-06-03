import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { CurrentStaff } from '../../decorators/current-staff.decorator';
import { AuthService } from './auth.service';
import { AuthDto } from './dtos/auth.dto';
import { SigninStaffDto } from './dtos/signin-staff.dto';
import { LocalAuthGuard } from './guards/local.guard';
import { Public } from '@/decorators/public.decorator';
import { StaffEntity } from '../management/staffs/entities/staff.entity';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
@Serializer(AuthDto)
export class AuthController {
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
    const { staff, token } = await this.authService.signIn(currentStaff);

    // Set token in cookie
    res.cookie('token', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return { staff, token };
  }

  @Post('signout')
  async signOut(@Res({ passthrough: true }) res: Response, @CurrentStaff() currentStaff: StaffEntity) {
    await this.authService.signOut(currentStaff?.id);
    res.clearCookie('token');
    return true;
  }

  @Get('whoami')
  whoami(@CurrentStaff() staff: StaffEntity) {
    return { staff };
  }
}
