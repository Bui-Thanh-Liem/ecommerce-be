import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Serializer } from 'src/interceptors/serializer.interceptor';
import { CurrentStaff } from '../../decorators/current-staff.decorator';
import { StaffEntity } from '../staffs/entities/staff.entity';
import { AuthService } from './auth.service';
import { AuthDto } from './dtos/auth.dto';
import { SigninStaffDto } from './dtos/signin-user.dto';
import { GoogleAuthGuard } from './guards/google.guard';
import { JwtAuthGuard } from '../../guards/auth.guard';
import { LocalAuthGuard } from './guards/local.guard';

@Controller('auth')
@Serializer(AuthDto)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @UseGuards(LocalAuthGuard)
  signIn(
    @Body() signInDto: SigninStaffDto, // Giữ lại cho ValidationPipe - Swagger
    @CurrentStaff() currentStaff: StaffEntity,
    @Res() res: Response,
  ) {
    const { user, token } = this.authService.signIn(currentStaff);

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: 'lax',
    });

    return res.json({ user, token });
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleCallback(@Req() req: Request, @CurrentStaff() currentStaff: StaffEntity) {
    return currentStaff;
  }

  @Post('signout')
  signOut(@Res() res: Response) {
    res.clearCookie('token');
    return { message: 'Signed out successfully' };
  }

  @Get('whoami')
  @UseGuards(JwtAuthGuard)
  whoami(@CurrentStaff() staff: StaffEntity) {
    return staff;
  }
}
