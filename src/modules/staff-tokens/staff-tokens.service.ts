import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { sign } from 'jsonwebtoken';
import ms, { StringValue } from 'ms';
import { StaffTokenType } from '@/shared/enums/staff-token-type.enum';
import { IJwtPayload } from '@/shared/interfaces/jwt-payload.interface';
import { Repository } from 'typeorm';
import { StaffTokenEntity } from './entities/staff-token.entity';

@Injectable()
export class StaffTokensService {
  constructor(
    @InjectRepository(StaffTokenEntity)
    private staffTokenRepo: Repository<StaffTokenEntity>,
    private configService: ConfigService,
  ) {}

  //
  async findAll() {
    return await this.staffTokenRepo.find({ relations: ['staffId'] });
  }

  // Revoke a token by marking it as revoked in the database
  // This allows us to keep a record of issued tokens and their status
  async revokeToken(token: string, type: StaffTokenType) {
    const staffToken = await this.staffTokenRepo.findOneBy({ token, type });
    if (staffToken) {
      staffToken.isRevoked = true;
      await this.staffTokenRepo.save(staffToken);
    }
  }

  //
  generateToken({
    payload,
    expiresIn,
    secretKey,
  }: {
    secretKey: string;
    payload: IJwtPayload;
    expiresIn: StringValue;
  }): string {
    return sign(payload, secretKey, { expiresIn });
  }

  // Delete all tokens of a staff (e.g., when they log out or when we want to invalidate all sessions)
  async delete(userId: string, type: StaffTokenType) {
    await this.staffTokenRepo.delete({ staffId: { id: userId }, type, isRevoked: false });
  }

  //
  async updateAuthToken(staffId: string) {
    // Tìm token hiện tại của staff
    const existingToken = await this.staffTokenRepo.findOne({
      where: { staffId: { id: staffId }, type: StaffTokenType.REFRESH },
    });

    // Nếu token đã bị thu hồi, không cho phép tạo token mới
    if (existingToken?.isRevoked) {
      throw new BadRequestException('Token has been revoked');
    }

    if (existingToken) {
      // Xóa token cũ nếu đã tồn tại (chỉ tồn tại một phiên làm việc cho mỗi staff)
      await this.staffTokenRepo.remove(existingToken);
    }

    // Tạo token mới
    return await this.generateAuthTokenPair({ staffId });
  }

  //
  private async generateAuthTokenPair({ staffId }: { staffId: string }): Promise<{ access: string; refresh: string }> {
    const expiresInRefresh = this.configService.get<StringValue>('JWT_REFRESH_EXPIRES_IN') || '7d';

    // Tạo access token và refresh token
    const accessToken = this.generateToken({
      payload: { userId: staffId, type: StaffTokenType.ACCESS },
      secretKey: this.configService.get<string>('JWT_ACCESS_SECRET') || 'key-secret',
      expiresIn: this.configService.get<StringValue>('JWT_ACCESS_EXPIRES_IN') || '15m',
    });
    const refreshToken = this.generateToken({
      payload: { userId: staffId, type: StaffTokenType.REFRESH },
      secretKey: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-key-secret',
      expiresIn: expiresInRefresh,
    });

    // Lưu token vào database
    const staffToken = this.staffTokenRepo.create({
      token: refreshToken,
      staffId: { id: staffId },
      type: StaffTokenType.REFRESH,
      expiresAt: new Date(Date.now() + ms(expiresInRefresh)), // Tính thời gian hết hạn dựa trên expiresInRefresh
    });
    await this.staffTokenRepo.save(staffToken);

    return { access: accessToken, refresh: refreshToken };
  }
}
