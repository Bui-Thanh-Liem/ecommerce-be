import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { CustomersService } from '../customers.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local-customer') {
  constructor(private customerService: CustomersService) {
    super({
      usernameField: 'phone', // Use 'phone' instead of 'username' = 401 Unauthorized
      passwordField: 'otp', // Use 'otp' instead of 'password'
    });
  }

  async validate(phone: string, otp: string): Promise<unknown> {
    return await this.customerService.validateCustomer(phone, otp);
  }
}
