import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { CurrentStaff } from '../../decorators/current-staff.decorator';
import { StaffEntity } from '../staffs/entities/staff.entity';
import { AuthService } from './auth.service';
import { AuthDto } from './dtos/auth.dto';
import { SigninStaffDto } from './dtos/signin-staff.dto';
import { LocalAuthGuard } from './guards/local.guard';
import { Public } from '@/decorators/public.decorator';

@Controller('auth')
@Serializer(AuthDto)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signin')
  @UseGuards(LocalAuthGuard)
  async signIn(
    @Body() signInDto: SigninStaffDto, // Giữ lại cho ValidationPipe - Swagger
    @CurrentStaff() currentStaff: StaffEntity,
    @Res() res: Response,
  ) {
    const { staff, token } = await this.authService.signIn(currentStaff);

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.json({ staff, token });
  }

  @Post('signout')
  async signOut(@Res() res: Response, @CurrentStaff() currentStaff: StaffEntity) {
    await this.authService.signOut(currentStaff.id);
    res.clearCookie('token');
    return res.json({ message: 'Signed out successfully' });
  }

  @Get('whoami')
  whoami(@CurrentStaff() staff: StaffEntity) {
    return staff;
  }
}
