import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // có thể là 'email' hoặc 'username'
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    // Validate user credentials
    // Default req.user
    return await this.authService.validateUser(email, password);
  }
}
