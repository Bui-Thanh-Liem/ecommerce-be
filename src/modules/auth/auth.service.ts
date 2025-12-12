import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { verifyPassword } from 'src/utils/crypto';
import { excludeFields } from 'src/utils/lodash';
import { User } from '../user/entities/user.entity';
import { TokenService } from '../token/token.service';

@Injectable()
export class AuthService {
  @Inject()
  private readonly userService: UserService;

  @Inject()
  private tokenService: TokenService;

  // Login user and create token pair
  async login(payload: {
    userLogged: User;
    deviceInfo: string;
    ipAddress: string;
  }) {
    const { userLogged, deviceInfo, ipAddress } = payload;

    //  === Then login successful at strategy local ===
    // 1. Create token pair
    const tokens = await this.tokenService.createTokenPair({
      id: userLogged.id,
      deviceInfo,
      ipAddress,
    });

    // 2. Return user info + tokens
    return { tokens, user: excludeFields(userLogged, ['password']) };
  }

  // Validate user credentials
  async validateUser(email: string, password: string): Promise<User> {
    // 1. Find user by email
    const foundUser = await this.userService.findOneForAuth(email);
    if (!foundUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Check if user is active
    if (!foundUser.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    // 3. Check password
    const validatePassword = verifyPassword(password, foundUser.password);
    if (!validatePassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return foundUser; // Default req.user
  }

  // Refresh token
  async refreshToken(refreshToken: string) {
    return this.tokenService.refreshTokenExists(refreshToken);
  }

  // Logout
  async logout(refreshToken: string) {
    // Thu hồi RT trong DB
    return await this.tokenService.removeTokensOfUser(refreshToken);
  }
}
