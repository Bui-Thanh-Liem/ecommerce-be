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
import { type Response } from 'express';
import { CustomerMetadataDto } from './dto/metadata-customer.dto';
import { CustomerQueryDto } from './dto/query-customer.dto';
import { CustomerVerifiedDto } from './dto/customer-verified.dto';
import { Permissions } from '@/decorators/permission.decorator';
import { permissionsSeed } from '@/modules/management/permissions/seeding';
import { Public } from '@/decorators/public.decorator';

@Controller('customers')
@Serializer(CustomerDto)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Public()
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Giới hạn 5 yêu cầu mỗi phút cho endpoint login
  async login(@Body() loginCustomerDto: LoginCustomerDto) {
    return await this.customersService.login(loginCustomerDto);
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
    const { customer, token } = await this.customersService.verifyLoginOtp(currentCustomer);

    // Set token in cookie
    res.cookie('e_token_customer', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return { customer };
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
