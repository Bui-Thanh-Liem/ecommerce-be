import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, Repository } from 'typeorm';
import { Token } from './entities/token.entity';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

// Payload to create token pair
export interface ITokenPayload {
  id: string;
  deviceInfo: string;
  ipAddress: string;
}

// Decoded token interface
export interface IDecodedToken extends ITokenPayload {
  exp: number;
  iat: number;
}

//
@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private tokenRepo: Repository<Token>,
    private jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  // Create access token & refresh token
  async createTokenPair(payload: ITokenPayload) {
    const { id } = payload;

    // 1. Create access token & refresh token
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload), // 1h - default (add in app.module.ts)
      this.jwtService.signAsync(payload, {
        expiresIn: '30d',
        secret: process.env.JWT_REFRESH_SECRET || 'JWT_REFRESH_SECRET',
      }),
    ]);

    //  2. Find user
    const foundUser = await this.userService.findOne(id);
    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    // 3. Save token
    const dataCreate = this.tokenRepo.create({
      userId: foundUser,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
    await this.tokenRepo.save(dataCreate);

    // Return token pair
    return { accessToken, refreshToken };
  }

  // Refresh token
  async refreshTokenExists(refreshToken: string) {
    // ==== Detect unusual token usage ====
    // Token đã bị sử dụng để refresh nhiều lần (có dấu hiệu bị đánh cắp)
    // Revoke all tokens of user
    const unusual = await this.tokenRepo.findOne({
      where: {
        tokenUsage: In([refreshToken]),
      },
    });
    if (unusual) {
      const decoded = await this.jwtService.verifyAsync<IDecodedToken>(
        unusual.token,
      );
      if (decoded) {
        // Save user unusual token usage logic here
        // TODO

        // Revoke all tokens of user
        console.log('Unusual token usage detected for user:', decoded);
        await this.removeTokensOfUser(decoded.id);
      }
      throw new NotFoundException('Login again please'); // An toàn nhất là yêu cầu login lại
    }

    // ==== Normal flow ====
    // 1. Check token exists in database
    const foundToken = await this.tokenRepo.findOne({
      where: {
        isRevoked: false,
        token: refreshToken,
        expiresAt: MoreThan(new Date()),
      },
    });
    if (!foundToken) {
      // refresh token not found || expired
      throw new NotFoundException('Login again please');
    }

    // 2. Decode token
    const decoded = await this.jwtService.verifyAsync<IDecodedToken>(
      foundToken.token,
    );
    if (!decoded) {
      throw new NotFoundException('Token not valid');
    }

    // 3. Create new token pair
    const payload: ITokenPayload = {
      id: decoded.id,
      deviceInfo: decoded.deviceInfo,
      ipAddress: decoded.ipAddress,
    };
    const [accessToken, newRefreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        expiresIn: decoded.exp,
        secret: process.env.JWT_REFRESH_SECRET || 'JWT_REFRESH_SECRET',
      }),
    ]);

    // 4. Update refresh token in database
    foundToken.token = newRefreshToken;
    foundToken.tokenUsage = [
      ...(foundToken.tokenUsage ? foundToken.tokenUsage : []),
      refreshToken,
    ];
    await this.tokenRepo.save(foundToken);

    // 5. Return new token pair
    return { accessToken, refreshToken: newRefreshToken };
  }

  // Revoke refresh token
  async revokeRefreshToken(userId: string) {
    // Revoke refresh token
    const foundToken = await this.tokenRepo.findOne({
      where: { userId: { id: userId }, isRevoked: false },
    });
    if (!foundToken) {
      throw new NotFoundException('Token not found');
    }

    foundToken.isRevoked = true;
    return await this.tokenRepo.save(foundToken);
  }

  // Revoke all tokens of user
  async removeTokensOfUser(userId: string) {
    console.log('Removing all tokens of user:', userId);
    return await this.tokenRepo.delete({
      userId: { id: userId },
    });
  }
}
