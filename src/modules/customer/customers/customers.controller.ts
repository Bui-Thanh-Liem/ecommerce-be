import { CurrentStaff } from '@/decorators/current-staff.decorator';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { GoogleAuthGuard } from './guards/google.guard';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { CustomerDto } from './dto/customer.dto';
import { StaffEntity } from '@/modules/management/staffs/entities/staff.entity';
import { VerifyLoginOtpCustomerDto } from './dto/verify-login-otp-customer.dto';
import { Throttle } from '@nestjs/throttler';
import { LocalAuthGuard } from './guards/local.guard';
import { CurrentCustomer } from '@/decorators/current-customer.decorator';
import { CustomerEntity } from './entities/customer.entity';
import { CookieOptions, type Request, type Response } from 'express';
import { CustomerMetadataDto } from './dto/metadata-customer.dto';
import { CustomerQueryDto } from './dto/query-customer.dto';
import { CustomerVerifiedDto } from './dto/customer-verified.dto';
import { Permissions } from '@/decorators/permission.decorator';
import { permissionsSeed } from '@/modules/management/permissions/seeding';
import { Public } from '@/decorators/public.decorator';
import { RefreshTokenAuthCustomerGuard } from './guards/refresh-token.guard';
import { GetJwtPayload } from '@/decorators/get-jwt-payload.decorator';
import { type IJwtPayload } from '@/shared/interfaces/common/jwt-payload.interface';
import { Customer } from '@/decorators/customer.decorator';

@Controller('customers')
@Serializer(CustomerDto)
export class CustomersController {
  private readonly defaultConfig: CookieOptions = {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  };

  constructor(private readonly customersService: CustomersService) {}

  @Public()
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Giới hạn 5 yêu cầu mỗi phút cho endpoint login
  async login(@Body() loginCustomerDto: LoginCustomerDto) {
    return await this.customersService.login(loginCustomerDto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Giới hạn 1 yêu cầu mỗi 15 phút cho endpoint refresh-token
  @Post('signout')
  @UseGuards(RefreshTokenAuthCustomerGuard)
  async signOut(@Res({ passthrough: true }) res: Response, @GetJwtPayload() jwtPayload: IJwtPayload) {
    if (jwtPayload) {
      await this.customersService.signOut(jwtPayload.customerId!);
    }
    res.clearCookie('e_token_customer');
    res.clearCookie('e_refresh_token_customer');
    return true;
  }

  @Public()
  @Post('verify-login-otp')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Giới hạn 5 yêu cầu mỗi phút cho endpoint verify OTP
  @UseGuards(LocalAuthGuard)
  @Serializer(CustomerVerifiedDto)
  async verifyLoginOtp(
    @Body() dto: VerifyLoginOtpCustomerDto, // Giữ lại cho ValidationPipe - Swagger
    @CurrentCustomer() currentCustomer: CustomerEntity,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { customer, token, refreshToken } = await this.customersService.verifyLoginOtp(currentCustomer);

    //
    res.cookie('e_token_customer', token, { ...this.defaultConfig }); // 15 phút
    res.cookie('e_refresh_token_customer', refreshToken, { ...this.defaultConfig, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 30 ngày

    return { customer };
  }

  @Public()
  @Throttle({ default: { limit: 1, ttl: 900000 } }) // Giới hạn 1 yêu cầu mỗi 15 phút cho endpoint refresh-token
  @Post('refresh-token')
  @UseGuards(RefreshTokenAuthCustomerGuard)
  async refreshToken(
    @Req() request: Request,
    @GetJwtPayload() jwtPayload: IJwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = request.cookies['e_refresh_token_customer'] as string;

    //
    const tokens = await this.customersService.refreshToken(refreshToken, jwtPayload);

    //
    if (!tokens) {
      res.clearCookie('e_token_customer');
      res.clearCookie('e_refresh_token_customer');
      return false;
    }

    //
    const refreshMaxAge = Math.floor(jwtPayload.exp! - Date.now() / 1000) * 1000; // ms
    res.cookie('e_token_customer', tokens?.access, { ...this.defaultConfig }); // 15 phút
    res.cookie('e_refresh_token_customer', tokens?.refresh, { ...this.defaultConfig, maxAge: refreshMaxAge });

    return true;
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {}

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleCallback(@Req() req: Request, @CurrentStaff() currentStaff: StaffEntity) {
    return currentStaff;
  }

  @Get()
  @Permissions(permissionsSeed.customer.read.code)
  @Serializer(CustomerMetadataDto)
  async findAll(@Query() queries: CustomerQueryDto) {
    return await this.customersService.findAll(queries);
  }

  @Get(':id')
  @Permissions(permissionsSeed.customer.read.code)
  async findOne(@Param('id') id: string) {
    return await this.customersService.findOne(id);
  }

  @Customer()
  @Patch('/update-profile')
  async updateProfile(@CurrentCustomer() customer: CustomerEntity, @Body() updateCustomerDto: UpdateCustomerDto) {
    return await this.customersService.update(customer.id, updateCustomerDto);
  }

  @Patch(':id')
  @Permissions(permissionsSeed.customer.update.code)
  async update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return await this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.customersService.remove(id);
  }
}
