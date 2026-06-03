import { CurrentStaff } from '@/decorators/current-staff.decorator';
import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { GoogleAuthGuard } from './guards/google.guard';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { CustomerDto } from './dto/customer.dto';
import { StaffEntity } from '@/modules/management/staffs/entities/staff.entity';
import { VerifyOtpCustomerDto } from './dto/verify-otp-customer.dto';
import { Throttle } from '@nestjs/throttler';
import { LocalAuthGuard } from './guards/local.guard';
import { CurrentCustomer } from '@/decorators/current-customer.decorator';
import { CustomerEntity } from './entities/customer.entity';
import { type Response } from 'express';
import { CustomerMetadataDto } from './dto/metadata-customer.dto';

@Controller('customers')
@Serializer(CustomerDto)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Giới hạn 5 yêu cầu mỗi phút cho endpoint login
  async login(@Body() loginCustomerDto: LoginCustomerDto) {
    return await this.customersService.login(loginCustomerDto);
  }

  @Post('verify-otp')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Giới hạn 5 yêu cầu mỗi phút cho endpoint verify OTP
  @UseGuards(LocalAuthGuard)
  async verifyOtp(
    @Body() verifyOtpCustomerDto: VerifyOtpCustomerDto,
    @CurrentCustomer() currentCustomer: CustomerEntity,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { customer, token } = await this.customersService.verifyOtp(currentCustomer);

    // Set token in cookie
    res.cookie('token-customer', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return { customer, token };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleCallback(@Req() req: Request, @CurrentStaff() currentStaff: StaffEntity) {
    return currentStaff;
  }

  @Get()
  @Serializer(CustomerMetadataDto)
  async findAll() {
    return await this.customersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.customersService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return await this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.customersService.remove(id);
  }
}
