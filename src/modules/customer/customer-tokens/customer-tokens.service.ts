import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerTokenEntity } from './entities/customer-token.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TokenType } from '@/shared/enums/token-type.enum';
import { IJwtPayload } from '@/shared/interfaces/common/jwt-payload.interface';
import ms, { StringValue } from 'ms';
import { sign } from 'jsonwebtoken';

@Injectable()
export class CustomerTokensService {
  constructor(
    @InjectRepository(CustomerTokenEntity)
    private customerTokenRepo: Repository<CustomerTokenEntity>,
    private configService: ConfigService,
  ) {}

  // Revoke a token by marking it as revoked in the database
  // This allows us to keep a record of issued tokens and their status
  async revokeToken(token: string, type: TokenType) {
    const customerToken = await this.customerTokenRepo.findOneBy({ token, type });
    if (customerToken) {
      customerToken.isRevoked = true;
      await this.customerTokenRepo.save(customerToken);
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

  // Delete all tokens of a customer (e.g., when they log out or when we want to invalidate all sessions)
  async delete(customerId: string, type: TokenType) {
    await this.customerTokenRepo.delete({ customer: { id: customerId }, type, isRevoked: false });
  }

  //
  async updateAuthToken(customerId: string) {
    // Tìm token hiện tại của customer
    const existingToken = await this.customerTokenRepo.findOne({
      where: { customer: { id: customerId }, type: TokenType.REFRESH },
    });

    // Nếu token đã bị thu hồi, không cho phép tạo token mới
    if (existingToken?.isRevoked) {
      throw new BadRequestException('Token has been revoked');
    }

    if (existingToken) {
      // Xóa token cũ nếu đã tồn tại (chỉ tồn tại một phiên làm việc cho mỗi customer)
      await this.customerTokenRepo.remove(existingToken);
    }

    // Tạo token mới
    return await this.generateAuthTokenPair({ customerId });
  }

  //
  async refreshAuthToken(refreshToken: string, jwtPayload: IJwtPayload) {
    //
    const existingTokenUsed = await this.customerTokenRepo.findOne({
      where: { usedToken: refreshToken, type: TokenType.REFRESH },
      relations: ['customer'],
      select: { customer: { id: true } },
    });
    if (existingTokenUsed) {
      // Nếu token đã được sử dụng để đổi lấy access token mới, thì xóa token đó đi và không cho phép tạo token mới nữa
      // Cho customer đăng nhập lại ở mọi nơi nếu phát hiện token bị lạm dụng
      await this.delete(existingTokenUsed.customer.id, TokenType.REFRESH);
      throw new BadRequestException('Refresh token has already been used');
    }

    // Tìm token hiện tại của customer
    const existingToken = await this.customerTokenRepo.findOne({
      where: { token: refreshToken, type: TokenType.REFRESH },
    });

    // Nếu không tìm thấy token hoặc token đã bị thu hồi, không cho phép tạo token mới
    if (!existingToken || existingToken.isRevoked) {
      throw new BadRequestException('Invalid refresh token');
    }

    // Tạo token mới
    const access = this.generateToken({
      payload: { customerId: jwtPayload.customerId, type: TokenType.ACCESS },
      secretKey: this.configService.get<string>('JWT_ACCESS_SECRET_CUSTOMER') || 'key-secret',
      expiresIn: this.configService.get<StringValue>('JWT_ACCESS_EXPIRES_IN_CUSTOMER') || '15m',
    });

    // Tính thời gian hết hạn của refresh token mới dựa trên exp của token cũ (nếu có) hoặc dựa trên cấu hình mặc định
    const exp = Math.floor(jwtPayload.exp! - Date.now() / 1000);
    const refresh = this.generateToken({
      payload: { customerId: jwtPayload.customerId, type: TokenType.REFRESH },
      secretKey: this.configService.get<string>('JWT_REFRESH_SECRET_CUSTOMER') || 'refresh-key-secret',
      expiresIn: exp,
    });

    // Cập nhật token mới vào database, đánh dấu token cũ đã dùng
    await this.customerTokenRepo.save({
      ...existingToken,
      usedToken: refreshToken, // đánh dấu token cũ đã dùng
      token: refresh, // lưu token mới
    });

    return { access, refresh };
  }

  //
  private async generateAuthTokenPair({
    customerId,
  }: {
    customerId: string;
  }): Promise<{ access: string; refresh: string }> {
    const expiresInRefresh = this.configService.get<StringValue>('JWT_REFRESH_EXPIRES_IN_CUSTOMER') || '30d';

    // Tạo access token và refresh token
    const accessToken = this.generateToken({
      payload: { customerId, type: TokenType.ACCESS },
      secretKey: this.configService.get<string>('JWT_ACCESS_SECRET_CUSTOMER') || 'key-secret',
      expiresIn: this.configService.get<StringValue>('JWT_ACCESS_EXPIRES_IN_CUSTOMER') || '15m',
    });
    const refreshToken = this.generateToken({
      expiresIn: expiresInRefresh,
      payload: { customerId, type: TokenType.REFRESH },
      secretKey: this.configService.get<string>('JWT_REFRESH_SECRET_CUSTOMER') || 'refresh-key-secret',
    });

    // Lưu refresh token vào database
    const customerToken = this.customerTokenRepo.create({
      token: refreshToken,
      customer: { id: customerId },
      type: TokenType.REFRESH,
      expiresAt: new Date(Date.now() + ms(expiresInRefresh)), // Tính thời gian hết hạn dựa trên expiresInRefresh
    });
    await this.customerTokenRepo.save(customerToken);

    return { access: accessToken, refresh: refreshToken };
  }
}
