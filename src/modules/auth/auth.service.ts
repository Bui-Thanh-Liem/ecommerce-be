import { Inject, Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  @Inject()
  private readonly userService: UserService;

  login(body: LoginDto) {
    return `This action returns all auth`;
  }
}
