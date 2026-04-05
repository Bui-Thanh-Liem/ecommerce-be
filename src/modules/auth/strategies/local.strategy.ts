import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'phone', // Use 'phone' instead of 'username' = 401 Unauthorized
    });
  }

  async validate(phone: string, password: string): Promise<unknown> {
    return await this.authService.validateStaff(phone, password);
  }
}
