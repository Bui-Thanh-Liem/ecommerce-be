import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { sign } from 'jsonwebtoken';
import ms, { StringValue } from 'ms';
import { TokenType } from '@/shared/enums/token-type.enum';
import { IJwtPayload } from '@/shared/interfaces/common/jwt-payload.interface';
import { Repository } from 'typeorm';
import { StaffTokenEntity } from './entities/staff-token.entity';

@Injectable()
export class StaffTokensService {
  constructor(
    @InjectRepository(StaffTokenEntity)
    private staffTokenRepo: Repository<StaffTokenEntity>,
    private configService: ConfigService,
  ) {}

  // Revoke a token by marking it as revoked in the database
  // This allows us to keep a record of issued tokens and their status
  async revokeToken(token: string, type: TokenType) {
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
    expiresIn: StringValue | number;
  }): string {
    return sign(payload, secretKey, { expiresIn });
  }

  // Delete all tokens of a staff (e.g., when they log out or when we want to invalidate all sessions)
  async delete(staffId: string, type: TokenType) {
    await this.staffTokenRepo.delete({ staff: { id: staffId }, type, isRevoked: false });
  }

  //
  async updateAuthToken(staffId: string) {
    // Tìm token hiện tại của staff
    const existingToken = await this.staffTokenRepo.findOne({
      where: { staff: { id: staffId }, type: TokenType.REFRESH },
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
  async refreshAuthToken(refreshToken: string, jwtPayload: IJwtPayload) {
    //
    const existingTokenUsed = await this.staffTokenRepo.findOne({
      where: { usedToken: refreshToken, type: TokenType.REFRESH },
      relations: ['staff'],
      select: { staff: { id: true } },
    });
    if (existingTokenUsed) {
      // Nếu token đã được sử dụng để đổi lấy access token mới, thì xóa token đó đi và không cho phép tạo token mới nữa
      // Cho staff đăng nhập lại ở mọi nơi nếu phát hiện token bị lạm dụng
      await this.delete(existingTokenUsed.staff.id, TokenType.REFRESH);
      throw new BadRequestException('Refresh token has already been used');
    }

    // Tìm token hiện tại của staff
    const existingToken = await this.staffTokenRepo.findOne({
      where: { token: refreshToken, type: TokenType.REFRESH },
    });

    // Nếu không tìm thấy token hoặc token đã bị thu hồi, không cho phép tạo token mới
    if (!existingToken || existingToken.isRevoked) {
      throw new BadRequestException('Invalid refresh token');
    }

    // Tạo token mới
    const access = this.generateToken({
      payload: { staffId: jwtPayload.staffId, type: TokenType.ACCESS },
      secretKey: this.configService.get<string>('JWT_ACCESS_SECRET') || 'key-secret',
      expiresIn: this.configService.get<StringValue>('JWT_ACCESS_EXPIRES_IN') || '15m',
    });

    // Tính thời gian hết hạn của refresh token mới dựa trên exp của token cũ (nếu có) hoặc dựa trên cấu hình mặc định
    const exp = Math.floor(jwtPayload.exp! - Date.now() / 1000);
    const refresh = this.generateToken({
      payload: { staffId: jwtPayload.staffId, type: TokenType.REFRESH },
      secretKey: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-key-secret',
      expiresIn: exp,
    });

    // Cập nhật token mới vào database, đánh dấu token cũ đã dùng
    await this.staffTokenRepo.save({
      ...existingToken,
      usedToken: refreshToken, // đánh dấu token cũ đã dùng
      token: refresh, // lưu token mới
    });

    return { access, refresh };
  }

  //
  private async generateAuthTokenPair({ staffId }: { staffId: string }): Promise<{ access: string; refresh: string }> {
    const expiresInRefresh = this.configService.get<StringValue>('JWT_REFRESH_EXPIRES_IN') || '30d';

    // Tạo access token và refresh token
    const accessToken = this.generateToken({
      payload: { staffId, type: TokenType.ACCESS },
      secretKey: this.configService.get<string>('JWT_ACCESS_SECRET') || 'key-secret',
      expiresIn: this.configService.get<StringValue>('JWT_ACCESS_EXPIRES_IN') || '15m',
    });
    const refreshToken = this.generateToken({
      payload: { staffId, type: TokenType.REFRESH },
      secretKey: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-key-secret',
      expiresIn: expiresInRefresh,
    });

    // Lưu refresh token vào database
    const staffToken = this.staffTokenRepo.create({
      token: refreshToken,
      staff: { id: staffId },
      type: TokenType.REFRESH,
      expiresAt: new Date(Date.now() + ms(expiresInRefresh)), // Tính thời gian hết hạn dựa trên expiresInRefresh
    });
    await this.staffTokenRepo.save(staffToken);

    return { access: accessToken, refresh: refreshToken };
  }
}
