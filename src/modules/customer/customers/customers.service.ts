import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerEntity } from './entities/customer.entity';
import { CustomerTokensService } from '../customer-tokens/customer-tokens.service';
import { CustomerQueryDto } from './dto/query-customer.dto';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { CacheService } from '@/common/cache/cache.service';
import { OrderService } from '@/common/otp/otp.service';
import { TokenType } from '@/shared/enums/token-type.enum';
import { IJwtPayload } from '@/shared/interfaces/common/jwt-payload.interface';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepo: Repository<CustomerEntity>,
    private customerTokensService: CustomerTokensService,
    private readonly otpService: OrderService,
    private cacheService: CacheService,
  ) {}

  async login(loginCustomerDto: LoginCustomerDto) {
    const { phone } = loginCustomerDto;

    //
    const existingCustomer = await this.customerRepo.exists({ where: { phone } });
    if (!existingCustomer) {
      const newCustomer = this.customerRepo.create({ phone, address: [], fullname: 'bạn chưa cung cấp thông tin' });
      await this.customerRepo.save(newCustomer);
    }

    //
    try {
      // Gửi mã OTP qua SMS
      const otp = this.randomOtp();
      await this.cacheService.set(`otp:${phone}`, otp, 5 * 60 * 1000); // Lưu OTP trong cache với TTL 5 phút
      this.otpService.sendOtp(phone, otp);

      return { message: 'OTP code sent successfully' };
    } catch (error) {
      this.logger.error(`Failed to send OTP code to ${phone}: ${(error as Error)?.message}`);
      throw new BadRequestException('Send code failed');
    }
  }

  async validateCustomer(phone: string, otp: string) {
    // Lấy OTP từ cache
    const cachedOtp = await this.cacheService.get(`otp:${phone}`);
    if (!cachedOtp) throw new UnauthorizedException('OTP code has expired or is invalid, please request a new one');

    // So sánh OTP nhập vào với OTP trong cache
    if (otp !== cachedOtp) throw new UnauthorizedException('Invalid OTP code');
    await this.cacheService.delete(`otp:${phone}`); // Xóa OTP sau khi xác thực thành công

    // Tìm khách hàng theo số điện thoại
    const customer = await this.customerRepo.findOne({ where: { phone } });
    if (!customer) throw new NotFoundException('Customer not found');

    //
    return customer;
  }

  async verifyLoginOtp(customer: CustomerEntity) {
    const { access, refresh } = await this.customerTokensService.updateAuthToken(customer.id);
    return { customer, token: access, refreshToken: refresh };
  }

  // Sign out a customer by revoking the token
  async signOut(customerId: string) {
    await this.customerTokensService.delete(customerId, TokenType.REFRESH);
  }

  //
  async refreshToken(refreshToken: string, jwtPayload: IJwtPayload) {
    try {
      return await this.customerTokensService.refreshAuthToken(refreshToken, jwtPayload);
    } catch (error) {
      this.logger.error('Refresh token fail :::', error);
      return false;
    }
  }

  async findAll(queries: CustomerQueryDto) {
    const { page, limit } = queries;

    //
    const { skip, take } = calculatePagination(page, limit);

    //
    const queryBuilder = this.customerRepo
      .createQueryBuilder('customer')

      // Join các quan hệ
      // .leftJoinAndSelect('customer.ratings', 'rating')

      // Select các trường cụ thể
      .select([
        'customer.id',
        'customer.fullname',
        'customer.phone',
        'customer.email',
        'customer.isActive',
        'customer.address',
        'customer.createdAt',
      ]);

    // Phân trang và sắp xếp
    queryBuilder.orderBy('customer.createdAt', 'DESC').skip(skip).take(take);

    const [data, totalData] = await queryBuilder.getManyAndCount();

    return {
      data,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async findOne(id: string) {
    return await this.customerRepo.findOne({ where: { id } });
  }

  async exists(ids: string[]) {
    const count = await this.customerRepo.countBy({ id: In(ids) });
    return count === ids.length;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { phone, ...rest } = updateCustomerDto;

    // Tải khách hàng cần cập nhật và cập nhật thông tin
    const customer = await this.customerRepo.preload({ id, ...rest });
    if (!customer) throw new NotFoundException('Customer not found');

    // Kiểm tra số điện thoại có bị trùng với khách hàng khác không
    return await this.customerRepo.save(customer);
  }

  private randomOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async remove(id: string) {
    const customer = await this.customerRepo.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return await this.customerRepo.remove(customer);
  }
}
